import fs from "fs";

/* ---------------- CONFIG ---------------- */

const MF_DB_FILE = "mf_db.json";
const OUT_FILE = "mf_master.json";
const YAHOO_TIMEOUT_MS = 5000;
const THROTTLE_MS = 200;

/* ---------------- LOAD MF DB ---------------- */

let raw;

try {
  raw = fs.readFileSync(MF_DB_FILE, "utf8");
} catch {
  console.error("❌ mf_db.json not found");
  process.exit(1);
}

let schemes;

try {
  schemes = JSON.parse(raw);
} catch (e) {
  console.error("❌ Invalid JSON in mf_db.json");
  console.error(e.message);
  process.exit(1);
}

if (!Array.isArray(schemes)) {
  console.error("❌ mf_db.json must be an array");
  process.exit(1);
}

console.log(`📦 Loaded ${schemes.length} schemes`);

let existingMaster = [];

if (fs.existsSync("mf_master.json")) {
  try {
    existingMaster = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));
  } catch {
    console.warn("⚠️ Existing mf_master.json invalid, rebuilding fully");
  }
}

const existingCodes = new Set(existingMaster.map(s => s.code));


/* ---------------- HARDENED YAHOO VALIDATION ---------------- */

async function validateYahoo(symbol) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), YAHOO_TIMEOUT_MS);

    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    if (!res.ok) return false;

    const json = await res.json();
    return Array.isArray(json?.chart?.result);
  } catch {
    return false;
  }
}

/* ---------------- BUILD MASTER ---------------- */

const output = [];

for (const s of schemes) {
  if (!s.code || !s.name) continue;

  const yahoo = `${s.code}.BO`;

  console.log(`🔎 Validating Yahoo symbol: ${yahoo}`);

  let isValid = null;

  if (!existingCodes.has(s.code)) {
    console.log(`🆕 New scheme detected → validating ${yahoo}`);
    isValid = await validateYahoo(yahoo);
  } else {
    // reuse previous validation result
    const prev = existingMaster.find(x => x.code === s.code);
    isValid = prev?.yahoo ?? null;
  }

  output.push({
    code: s.code,
    name: s.name.trim(),
    category: s.category || "Unknown",
    yahoo: isValid ? yahoo : null
  });

  await new Promise(r => setTimeout(r, THROTTLE_MS));
}

/* ---------------- SAVE ---------------- */

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

console.log(`✅ mf_master.json built (${output.length} schemes)`);

process.exit(0);

