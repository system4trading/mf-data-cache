import fs from "fs";
import fetch from "node-fetch";

const MASTER_FILE = "./mf_master.json";
const OUT_DIR = "./amfi";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

if (!fs.existsSync(MASTER_FILE)) {
  console.error("❌ mf_master.json missing");
  process.exit(1);
}

const schemes = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));

console.log(`📦 Loaded ${schemes.length} schemes`);

async function fetchAMFI(code) {
  const url = `https://www.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?sc=${code}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  return res.text();
}

function parseAMFI(text) {
  const lines = text.split("\n");
  const navs = [];

  for (const line of lines) {
    const parts = line.split(";");
    if (parts.length >= 2) {
      const nav = parseFloat(parts[1]);
      if (!isNaN(nav)) {
        navs.push({ date: parts[0], nav });
      }
    }
  }
  return navs;
}

for (const s of schemes) {
  if (!s.code) continue;

  try {
    console.log(`📥 Fetching AMFI NAV: ${s.code}`);
    const raw = await fetchAMFI(s.code);
    const navs = parseAMFI(raw);

    if (navs.length > 10) {
      fs.writeFileSync(
        `${OUT_DIR}/nav_${s.code}.json`,
        JSON.stringify(navs, null, 2)
      );
      console.log(`✅ Saved ${navs.length} NAV rows`);
    } else {
      console.warn(`⚠️ No NAV data for ${s.code}`);
    }

    await new Promise(r => setTimeout(r, 800));
  } catch (e) {
    console.error(`❌ Failed ${s.code}`);
  }
}

console.log("🏁 AMFI NAV fetch complete");
