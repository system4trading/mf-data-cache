import fs from "fs";
import path from "path";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));
const OUT_DIR = "yahoo";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function fetchYahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=10y&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": "mf-analytics-bot" }
  });

  if (!res.ok) return [];

  const json = await res.json();

  const result = json?.chart?.result?.[0];
  if (!result) return [];

  const ts = result.timestamp;
  const closes = result.indicators?.quote?.[0]?.close;

  if (!Array.isArray(ts) || !Array.isArray(closes)) return [];

  const rows = [];
  for (let i = 0; i < ts.length; i++) {
    if (closes[i] == null) continue;

    rows.push({
      date: new Date(ts[i] * 1000).toISOString().slice(0, 10),
      nav: Number(closes[i])
    });
  }

  return rows;
}

for (const s of MASTER) {
  if (!s.yahoo) continue;

  console.log(`📊 Yahoo NAV: ${s.code}`);

  const data = await fetchYahoo(s.yahoo);

  if (!data.length) {
    console.warn(`⚠️ No Yahoo data for ${s.code}`);
    continue;
  }

  fs.writeFileSync(
    path.join(OUT_DIR, `nav_${s.code}.json`),
    JSON.stringify(data, null, 2)
  );

  await new Promise(r => setTimeout(r, 300));
}

console.log("✅ Yahoo NAV fetch complete");
