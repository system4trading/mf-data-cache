import fs from "fs";
import path from "path";

/* ---------------- CONFIG ---------------- */

const NAVALL_FILE = "amfi/NAVAll.txt";
const OUT_DIR = "amfi";

/* ---------------- SAFETY ---------------- */

if (!fs.existsSync(NAVALL_FILE)) {
  console.error("❌ NAVAll.txt not found");
  process.exit(1);
}

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

/* ---------------- LOAD NAVALL ---------------- */

const raw = fs.readFileSync(NAVALL_FILE, "utf8");

const lines = raw
  .split("\n")
  .map(l => l.trim())
  .filter(l => l && !l.startsWith("Scheme Code"));

/*
Format:
Scheme Code;ISIN1;ISIN2;Scheme Name;NAV;Date
*/

const parsed = [];

for (const line of lines) {
  const cols = line.split(";");

  if (cols.length < 6) continue;

  const code = cols[0].trim();
  const nav = parseFloat(cols[4]);
  const date = cols[5].trim(); // 🔥 removes \r

  if (!code || isNaN(nav) || !date) continue;

  parsed.push({ code, date, nav });
}

console.log(`📥 Parsed ${parsed.length} NAV rows`);

/* ---------------- GROUP BY SCHEME ---------------- */

const byScheme = new Map();

for (const r of parsed) {
  if (!byScheme.has(r.code)) byScheme.set(r.code, []);
  byScheme.get(r.code).push({ date: r.date, nav: r.nav });
}

/* ---------------- DELTA WRITE ---------------- */

let updated = 0;

for (const [code, rows] of byScheme.entries()) {
  const file = path.join(OUT_DIR, `nav_${code}.json`);

  let existing = [];

  if (fs.existsSync(file)) {
    try {
      existing = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      console.warn(`⚠️ Corrupt NAV file → rebuilding ${code}`);
      existing = [];
    }
  }

  const seenDates = new Set(existing.map(x => x.date));

  const delta = rows
    .filter(r => !seenDates.has(r.date))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!delta.length) continue;

  const merged = [...existing, ...delta];

  // rollback-safe write
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(merged, null, 2));
  fs.renameSync(tmp, file);

  updated++;
}

console.log(`✅ NAV updated for ${updated} schemes`);
console.log("🏁 build_nav_history.js complete");
