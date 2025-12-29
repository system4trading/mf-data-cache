import fs from "fs";
import fetch from "node-fetch";

/* -------------------------
   STEP 1: SAFE INPUT LOAD
-------------------------- */

const INPUT_FILE = "mf_db.json";
const OUTPUT_FILE = "mf_master.json";

let rawText;
try {
  rawText = fs.readFileSync(INPUT_FILE, "utf8");
} catch (e) {
  console.error(`❌ ${INPUT_FILE} not found`);
  process.exit(1);
}

let raw;
try {
  raw = JSON.parse(rawText);
} catch (e) {
  console.error(`❌ Invalid JSON in ${INPUT_FILE}`);
  console.error(e.message);
  process.exit(1);
}

if (!Array.isArray(raw)) {
  console.error(`❌ ${INPUT_FILE} must be an array`);
  process.exit(1);
}

console.log(`📦 Loaded ${raw.length} MF records from ${INPUT_FILE}`);

/* -------------------------
   STEP 2: YAHOO VALIDATION
-------------------------- */

async function validateYahoo(symbol) {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    );
    const j = await r.json();
    return !!j.chart?.result;
  } catch {
    return false;
  }
}

/* -------------------------
   STEP 3: BUILD MF MASTER
-------------------------- */

const result = [];

for (const s of raw) {
  if (!s.code || !s.name || !s.category) {
    console.warn(`⚠️ Skipping invalid entry: ${JSON.stringify(s)}`);
    continue;
  }

  const yahooSymbol = `${s.code}.BO`;
  const isValidYahoo = await validateYahoo(yahooSymbol);

  result.push({
    code: String(s.code),
    name: s.name.trim(),
    category: s.category.trim(),
    yahoo: isValidYahoo ? yahooSymbol : null
  });

  // throttle (Yahoo-safe)
  await new Promise(r => setTimeout(r, 200));
}

/* -------------------------
   STEP 4: WRITE OUTPUT
-------------------------- */

fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(result, null, 2)
);

console.log(`✅ ${OUTPUT_FILE} built successfully`);
console.log(`📊 Valid Yahoo symbols: ${result.filter(r => r.yahoo).length}`);
