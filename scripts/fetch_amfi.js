import fs from "fs";
import fetch from "node-fetch";

const MASTER_FILE = "mf_master.json";
const OUT_DIR = "amfi";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const schemes = JSON.parse(fs.readFileSync(MASTER_FILE));

async function fetchAMFINav(code) {
  const url = `const url = `https://www.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?sc=${code}`;
  const r = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  const text = await r.text();
  return text;
}

function parseAMFI(text) {
  const lines = text.split("\n");
  const data = [];

  for (const line of lines) {
    const parts = line.split(";");
    if (parts.length >= 3 && parts[1] && parts[2]) {
      data.push({
        date: parts[0],
        nav: parseFloat(parts[1])
      });
    }
  }
  return data;
}

for (const s of schemes) {
  try {
    console.log(`📥 AMFI ${s.code} ${s.name}`);
    const raw = await fetchAMFINav(s.code);
    const nav = parseAMFI(raw);

    if (nav.length > 10) {
      fs.writeFileSync(
        `${OUT_DIR}/nav_${s.code}.json`,
        JSON.stringify(nav, null, 2)
      );
    }

    await new Promise(r => setTimeout(r, 800)); // AMFI-safe
  } catch (e) {
    console.error(`❌ AMFI failed for ${s.code}`);
  }
}

console.log("✅ AMFI historical NAV fetch complete");
