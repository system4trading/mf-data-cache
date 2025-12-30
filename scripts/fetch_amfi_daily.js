import fs from "fs";
import path from "path";

const AMFI_DAILY_URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const NAV_DIR = "amfi";

if (!fs.existsSync(NAV_DIR)) {
  fs.mkdirSync(NAV_DIR, { recursive: true });
}

console.log("📥 Fetching AMFI daily NAV…");

const res = await fetch(AMFI_DAILY_URL, {
  headers: {
    "User-Agent": "mf-analytics-bot"
  }
});

if (!res.ok) {
  console.error("❌ Failed to fetch AMFI daily NAV");
  process.exit(1);
}

const text = await res.text();
const lines = text.split("\n");

let currentScheme = null;
let updates = 0;

for (const line of lines) {
  if (!line.includes(";")) continue;

  const parts = line.split(";");
  if (parts.length < 6) continue;

  const schemeCode = parts[0];
  const date = parts[parts.length - 1];

  // NAV is the first numeric-looking value from right
  let nav = null;
  for (let i = parts.length - 2; i >= 0; i--) {
    const v = parts[i].replace(",", "");
    if (!isNaN(v) && Number(v) > 0) {
      nav = Number(v);
      break;
    }
  }

  if (!nav || !date) continue;


    if (!/^\d+$/.test(schemeCode)) continue;
    if (!nav || !date) continue;

    const file = path.join(NAV_DIR, `nav_${schemeCode}.json`);

    let history = [];
    if (fs.existsSync(file)) {
      try {
        history = JSON.parse(fs.readFileSync(file, "utf8"));
      } catch {
        history = [];
      }
    }

    // Avoid duplicate date
    if (history.some(r => r.date === date)) continue;

    history.push({
      date,
      nav: parseFloat(nav)
    });

    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    fs.writeFileSync(file, JSON.stringify(history, null, 2));
    updates++;
  }

  console.log(`✅ Daily NAV update complete (${updates} updates)`);
