import fs from "fs";

/* ---------------- CONFIG ---------------- */

const MF_DB_FILE = "mf_db.json";
const OUT_FILE = "mf_master.json";
const YAHOO_TIMEOUT_MS = 5000;
const THROTTLE_MS = 200;

/* ---------------- LOAD MF DB ---------------- */

let schemes;

try {
  schemes = JSON.parse(fs.readFileSync(MF_DB_FILE, "utf8"));
} catch (e) {
  console.error("❌ Invalid or missing mf_db.json");
  process.exit(1);
}

if (!Array.isArray(schemes)) {
  console.error("❌ mf_db.json must be an array");
  process.exit(1);
}

console.log(`📦 Loaded ${schemes.length} schemes`);

/* ---------------- LOAD EXISTING MASTER ---------------- */

let existingMaster = [];

if (fs.existsSync(OUT_FILE)) {
  try {
    existingMaster = JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  } catch {
    console.warn("⚠️ Existing mf_master.json invalid, rebuilding fully");
  }
}

/* 🔥 CRITICAL FIX: use Map (O(1)) */
const existingMap = new Map(
  existingMaster.map(s => [String(s.code), s])
);

/* ---------------- YAHOO VALIDATION ---------------- */

async function validateYahoo(symbol) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    );
    const j = await res.json();

    const r = j?.chart?.result?.[0];

    // 🔒 Validation = symbol exists (not NAV data!)
    return !!r?.meta?.symbol;
  } catch {
    return false;
  }
}

/* ---------------- BUILD MASTER ---------------- */

const output = [];
let validatedCount = 0;

for (const s of schemes) {
  const code = String(s.code);

  if (
    !code ||
    !s.name ||
    isNaN(Number(code)) ||
    code.length < 4
  ) {
    continue;
  }

  /* ✅ Reuse existing entry if present */
  if (existingMap.has(code)) {
    output.push(existingMap.get(code));
    continue;
  }

  /* 🆕 New scheme only */
  const yahoo = `${code}.BO`;
  console.log(`🆕 Validating Yahoo symbol: ${yahoo}`);

  const yahooValid = await validateYahoo(yahoo);
  validatedCount++;

  output.push({
    code,
    name: s.name.trim(),
    category: s.category || "Unknown",
    yahoo: yahooValid ? yahoo : null,
    yahoo_validated: yahooValid
  });

  await new Promise(r => setTimeout(r, THROTTLE_MS));
}

/* ---------------- SAVE ---------------- */

fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), "utf8");

console.log(
  `✅ mf_master.json built: ${output.length} schemes (${validatedCount} newly validated)`
);

process.exit(0);

console.warn(
  "⚠️ Yahoo does not provide MF NAV history — skipping historical fetch"
);
process.exit(0);
