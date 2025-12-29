import fs from "fs";
import fetch from "node-fetch";
import path from "path";

const AMFI_URL = "https://www.amfiindia.com/net-asset-value/nav-history";
const MASTER_FILE = "mf_master.json";
const OUT_DIR = "amfi";

// Date range (5 years)
const FROM = "01-Jan-2019";
const TO = new Date().toLocaleDateString("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric"
}).replace(/ /g, "-");

// Throttling
const BATCH_SIZE = 50;
const DELAY_MS = 1500;

// ---------------- HELPERS ----------------
const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseAMFI(text) {
  const lines = text.split("\n");
  return lines
    .filter(l => l.includes(";"))
    .map(l => {
      const [date, nav] = l.split(";");
      if (!date || !nav || isNaN(nav)) return null;
      return {
        date: new Date(date).toISOString().slice(0, 10),
        nav: Number(nav)
      };
    })
    .filter(Boolean);
}

async function fetchAMFIHistory(code) {
  const params = new URLSearchParams({
    schemeCode: code,
    fromDate: FROM,
    toDate: TO
  });

  const res = await fetch(`${AMFI_URL}?${params}`, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!res.ok) throw new Error(`AMFI ${res.status}`);
  const text = await res.text();
  return parseAMFI(text);
}

// Yahoo fallback
async function fetchYahooFallback(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5y&interval=1d`;
  const res = await fetch(url);
  const json = await res.json();

  const r = json.chart?.result?.[0];
  if (!r) return null;

  return r.timestamp.map((t, i) => ({
    date: new Date(t * 1000).toISOString().slice(0, 10),
    nav: r.indicators.quote[0].close[i]
  })).filter(d => d.nav);
}

// ---------------- MAIN ----------------
fs.mkdirSync(OUT_DIR, { recursive: true });

const schemes = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));

let processed = 0;

for (let i = 0; i < schemes.length; i += BATCH_SIZE) {
  const batch = schemes.slice(i, i + BATCH_SIZE);

  await Promise.all(batch.map(async scheme => {
    const outFile = path.join(OUT_DIR, `nav_${scheme.code}.json`);

    if (fs.existsSync(outFile)) return;

    try {
      console.log(`📈 AMFI NAV → ${scheme.code}`);
      const data = await fetchAMFIHistory(scheme.code);

      if (!data.length) throw new Error("Empty AMFI data");

      fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
    } catch (err) {
      if (scheme.yahoo) {
        console.warn(`⚠️ AMFI failed, Yahoo fallback → ${scheme.code}`);
        const data = await fetchYahooFallback(scheme.yahoo);
        if (data?.length) {
          fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
        }
      }
    }
  }));

  processed += batch.length;
  console.log(`✅ Processed ${processed}/${schemes.length}`);
  await sleep(DELAY_MS);
}

console.log("🎉 AMFI historical NAV fetch complete");
