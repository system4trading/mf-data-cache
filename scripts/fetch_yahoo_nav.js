import fs from "fs";
import fetch from "node-fetch";

const schemes = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));
fs.mkdirSync("yahoo", { recursive: true });

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=20y&interval=1d`;
  const r = await fetch(url);
  const j = await r.json();

  const result = j.chart?.result?.[0];
  if (!result) return [];

  const ts = result.timestamp;
  const navs = result.indicators.adjclose[0].adjclose;

  return ts.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    nav: navs[i]
  })).filter(x => x.nav);
}

for (const s of schemes) {
  if (!s.yahoo) continue;

  console.log(`📊 Yahoo NAV: ${s.code}`);
  const data = await fetchYahoo(s.yahoo);

  if (!data.length) {
    console.warn(`⚠️ No Yahoo NAV for ${s.code}`);
    continue;
  }

  fs.writeFileSync(
    `yahoo/nav_${s.code}.json`,
    JSON.stringify(data, null, 2)
  );

  await new Promise(r => setTimeout(r, 500)); // throttle
}

console.log("✅ Yahoo historical NAV fetch complete");
