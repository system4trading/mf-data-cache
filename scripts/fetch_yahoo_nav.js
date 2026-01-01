import fs from "fs";
import fetch from "node-fetch";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json"));
const DIR = "amfi";

function toISO(ts) {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

for (const s of MASTER) {
  if (!s.yahoo) continue;

  const file = `${DIR}/nav_${s.code}.json`;
  if (fs.existsSync(file)) continue; // backfill once

  console.log(`📊 Yahoo backfill: ${s.code}`);

  const r = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${s.yahoo}?range=10y&interval=1d`
  );

  const j = await r.json();
  const res = j.chart?.result?.[0];
  if (!res) continue;

  const nav = res.timestamp.map((t, i) => ({
    date: toISO(t),
    nav: res.indicators.adjclose[0].adjclose[i]
  })).filter(x => x.nav);

  fs.writeFileSync(file, JSON.stringify(nav, null, 2));
}
