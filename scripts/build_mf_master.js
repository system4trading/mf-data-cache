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

  const isValid = await validateYahoo(yahoo);

  output.push({
    code: s.code,
    name: s.name.trim(),
    category: s.category || "Unknown",
    yahoo: isValid ? yahoo : null
  });

  // Throttle to avoid Yahoo rate limits
  await new Promise(r => setTimeout(r, THROTTLE_MS));
}

/* ---------------- SAVE ---------------- */

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

console.log(`✅ mf_master.json built (${output.length} schemes)`);

/* ---------------- EXIT CLEANLY ---------------- */

process.exit(0);
