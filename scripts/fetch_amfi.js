import fs from "fs";
import path from "path";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));
const OUT_DIR = "amfi";
const LOG_DIR = "logs";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const AMFI_URL =
  "https://www.amfiindia.com/net-asset-value/nav-history";

const sleep = ms => new Promise(r => setTimeout(r, ms));

const MAX_RETRIES = 3;
const RATE_LIMIT_MS = 2500; // AMFI safe

async function fetchSchemeHistory(code) {
  const body = new URLSearchParams({
    schemeCode: code,
    fromDate: "01-Jan-2000",
    toDate: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(AMFI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "mf-analytics-bot"
        },
        body
      });

      const text = await res.text();

      if (!text.includes("<table")) {
        throw new Error("No table found");
      }

      const rows = [...text.matchAll(/<tr>(.*?)<\/tr>/g)];
      const data = [];

      for (const r of rows) {
        const cols = [...r[1].matchAll(/<td>(.*?)<\/td>/g)].map(c =>
          c[1].replace(/&nbsp;/g, "").trim()
        );

        if (cols.length < 2) continue;

        const date = cols[0];
        const nav = parseFloat(cols[1]);

        if (!date || isNaN(nav)) continue;

        data.push({ date, nav });
      }

      return data.reverse(); // oldest → newest
    } catch (e) {
      console.warn(`⚠️ ${code} attempt ${attempt} failed`);
      await sleep(2000 * attempt);
    }
  }

  return [];
}

const health = {};

for (const s of MASTER) {
  console.log(`📥 Fetching AMFI history: ${s.code}`);

  const data = await fetchSchemeHistory(s.code);

  if (!data.length) {
    console.warn(`❌ No AMFI history for ${s.code}`);
    health[s.code] = { status: "missing" };
    continue;
  }

  // Gap detection
  const dates = data.map(d => new Date(d.date));
  let gaps = 0;

  for (let i = 1; i < dates.length; i++) {
    const diff =
      (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    if (diff > 5) gaps++;
  }

  health[s.code] = {
    records: data.length,
    gaps
  };

  fs.writeFileSync(
    path.join(OUT_DIR, `nav_${s.code}.json`),
    JSON.stringify(data, null, 2)
  );

  await sleep(RATE_LIMIT_MS);
}

fs.writeFileSync(
  "logs/amfi_health.json",
  JSON.stringify(health, null, 2)
);

console.log("🏁 AMFI historical fetch complete");
