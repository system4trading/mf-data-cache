import fs from "fs";
import { setTimeout as sleep } from "timers/promises";

/* ---------------- CONFIG ---------------- */

const MASTER_FILE = "mf_master.json";
const OUT_DIR = "amfi";
const YEARS = 10;
const DELAY_MS = 800;

/* ---------------- PREP ---------------- */

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const schemes = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"))
  .filter(s => s.yahoo);

console.log(`📦 Loaded ${schemes.length} Yahoo-validated schemes`);

/* ---------------- FETCH ---------------- */

async function fetchYahooHistory(symbol) {
  const to = Math.floor(Date.now() / 1000);
  const from = to - YEARS * 365 * 24 * 60 * 60;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${from}&period2=${to}&interval=1d&events=div`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!res.ok) return null;

  const json = await res.json();
  const r = json?.chart?.result?.[0];
  if (!r) return null;

  const ts = r.timestamp;
  const nav = r.indicators?.quote?.[0]?.close;

  if (!ts || !nav) return null;

  return ts.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    nav: nav[i]
  })).filter(x => x.nav != null);
}

/* ---------------- MAIN ---------------- */

let built = 0;

for (const s of schemes) {
  const outFile = `${OUT_DIR}/nav_${s.code}.json`;
  if (fs.existsSync(outFile)) continue;

  console.log(`📥 Yahoo NAV: ${s.code}`);

  const data = await fetchYahooHistory(s.yahoo);

  if (!data || data.length < 500) {
    console.warn(`⚠️ Insufficient data for ${s.code}`);
    continue;
  }

  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  built++;

  await sleep(DELAY_MS);
}

console.log(`✅ Bootstrap complete: ${built} schemes`);
