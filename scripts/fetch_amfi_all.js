import fs from "fs";
import fetch from "node-fetch";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json"));
const OUT_DIR = "amfi";
const BASE_URL = "https://www.amfiindia.com/net-asset-value/nav-history";
const DELAY = 1200;

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHistory(code) {
  const params = new URLSearchParams({
    "mfid": code,
    "fromDate": "01-Apr-2018",
    "toDate": new Date().toISOString().slice(0, 10)
  });

  const res = await fetch(`${BASE_URL}?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!res.ok) return null;

  const html = await res.text();

  const rows = [...html.matchAll(/<tr>\s*<td>(.*?)<\/td>\s*<td>(.*?)<\/td>/g)];

  return rows.map(r => ({
    date: r[1].trim(),
    nav: parseFloat(r[2])
  })).filter(r => !isNaN(r.nav));
}

for (const s of MASTER) {
  const file = `${OUT_DIR}/nav_${s.code}.json`;
  if (fs.existsSync(file)) continue; // already fetched

  console.log(`📥 AMFI history: ${s.code}`);
  const data = await fetchHistory(s.code);

  if (!data || data.length === 0) {
    console.warn(`⚠️ No AMFI history for ${s.code}`);
  } else {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${data.length} rows`);
  }

  await sleep(DELAY);
}

console.log("🏁 AMFI historical fetch complete");
