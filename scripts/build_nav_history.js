import fs from "fs";
import readline from "readline";
import path from "path";

/* ================= CONFIG ================= */

const NAVALL_FILE = "amfi/NAVAll.txt";          // Official AMFI file
const OUT_DIR = "amfi";                         // nav_XXXX.json files
const DATE_REGEX = /^(\d{2})-(\w{3})-(\d{4})$/;

/* ================= UTILS ================= */

function parseDate(d) {
  // "30-Dec-2025" → "2025-12-30"
  const [day, mon, year] = d.split("-");
  const months = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04",
    May: "05", Jun: "06", Jul: "07", Aug: "08",
    Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  return `${year}-${months[mon]}-${day}`;
}

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

/* ================= PREP ================= */

if (!fs.existsSync(NAVALL_FILE)) {
  console.error("❌ NAVAll.txt not found:", NAVALL_FILE);
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log("📦 Loading existing NAV files...");

/* Load existing NAV history & last dates */
const existingNAV = {};
const lastDates = {};

for (const file of fs.readdirSync(OUT_DIR)) {
  if (!file.startsWith("nav_") || !file.endsWith(".json")) continue;

  const code = file.replace("nav_", "").replace(".json", "");
  const data = safeReadJSON(path.join(OUT_DIR, file));

  if (Array.isArray(data) && data.length > 0) {
    existingNAV[code] = data;
    lastDates[code] = data[data.length - 1].date;
  } else {
    existingNAV[code] = [];
    lastDates[code] = null;
  }
}

/* Track new entries + missing days */
const newEntries = {};
const missingDays = {};

/* ================= STREAM PARSE ================= */

console.log("📥 Processing NAVAll.txt (delta-only)...");

const rl = readline.createInterface({
  input: fs.createReadStream(NAVALL_FILE),
  crlfDelay: Infinity
});

for await (const line of rl) {
  const clean = line.trim();
  if (!clean || clean.startsWith("Scheme Code")) continue;

  // Format: SCHEME;DATE;NAV
  const parts = clean.split(";");
  if (parts.length < 3) continue;

  const code = parts[0].trim();
  const rawDate = parts[1].trim().replace("\r", "");
  const nav = parseFloat(parts[2]);

  if (!DATE_REGEX.test(rawDate) || isNaN(nav)) continue;

  const date = parseDate(rawDate);
  const last = lastDates[code];

  if (last && date <= last) continue; // ✅ delta-only

  if (!newEntries[code]) newEntries[code] = [];
  newEntries[code].push({ date, nav });

  // Missing-day detection
  if (last) {
    const expected = new Date(last);
    expected.setDate(expected.getDate() + 1);

    const actual = new Date(date);
    if ((actual - expected) / 86400000 > 1) {
      if (!missingDays[code]) missingDays[code] = [];
      missingDays[code].push({ from: last, to: date });
    }
  }
}

/* ================= WRITE (ROLLBACK SAFE) ================= */

console.log("💾 Writing NAV updates...");

let updatedCount = 0;

for (const code of Object.keys(newEntries)) {
  const oldData = existingNAV[code] || [];
  const merged = [...oldData, ...newEntries[code]];

  const tmpFile = path.join(OUT_DIR, `nav_${code}.json.tmp`);
  const finalFile = path.join(OUT_DIR, `nav_${code}.json`);

  // 🔐 Rollback-safe write
  fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), "utf8");
  fs.renameSync(tmpFile, finalFile);

  updatedCount++;
}

/* ================= REPORT ================= */

console.log(`✅ NAV updated for ${updatedCount} schemes`);

if (Object.keys(missingDays).length > 0) {
  console.warn("⚠️ Missing NAV days detected:");
  for (const [code, gaps] of Object.entries(missingDays)) {
    console.warn(`  ${code}:`, gaps);
  }

  fs.writeFileSync(
    "nav_missing_days.json",
    JSON.stringify(missingDays, null, 2)
  );
}

console.log("🏁 build_nav_history.js complete");
