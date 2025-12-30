import fs from "fs";
import fetch from "node-fetch";

const INPUT = "mf_db.json";
const OUTPUT = "mf_master.json";
const YAHOO_NAV_DIR = "yahoo_nav";

/* ------------------ SAFE LOAD ------------------ */

if (!fs.existsSync(YAHOO_NAV_DIR)) {
  fs.mkdirSync(YAHOO_NAV_DIR);
}

let rawText;
try {
  rawText = fs.readFileSync(INPUT, "utf8");
} catch {
  console.error("❌ mf_db.json not found");
  process.exit(1);
}

let schemes;
try {
  schemes = JSON.parse(rawText);
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

/* ------------------ YAHOO HELPERS ------------------ */

async function fetchYahooChart(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`;
  const r = await fetch(url);
  const j = await r.json();
  return j.chart?.result?.[0] || null;
}

function extractNAV(chart) {
  const ts = chart.timestamp || [];
  const prices = chart.indicators?.quote?.[0]?.close || [];
  return ts.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    nav: prices[i]
  })).filter(d => d.nav !== null);
}

/* ------------------ BUILD MASTER ------------------ */

const result = [];

for (const s of schemes) {
  if (!s.code || !s.name || !s.category) continue;

  const yahoo = `${s.code}.BO`;
  let hasYahoo = false;

  try {
    const chart = await fetchYahooChart(yahoo);
    if (chart) {
      hasYahoo = true;

      const navSeries = extractNAV(chart);
      if (navSeries.length > 0) {
        fs.writeFileSync(
          `${YAHOO_NAV_DIR}/${s.code}.json`,
          JSON.stringify(navSeries, null, 2)
        );
      }
    }
  } catch {
    hasYahoo = false;
  }

  result.push({
    code: String(s.code),
    name: s.name.trim(),
    category: s.category.trim(),
    yahoo: hasYahoo ? yahoo : null,
    navFallback: hasYahoo
  });

  await new Promise(r => setTimeout(r, 300));
}

/* ------------------ WRITE OUTPUT ------------------ */

fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));

console.log("✅ mf_master.json built");
console.log(`📈 Yahoo fallback NAV available for ${result.filter(r => r.navFallback).length} schemes`);
