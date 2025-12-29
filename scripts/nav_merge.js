import fs from "fs";

const AMFI_DIR = "amfi";
const YAHOO_DIR = "yahoo_nav";
const OUT_DIR = "nav_merged";

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

const files = fs.readdirSync(AMFI_DIR).filter(f => f.endsWith(".json"));

for (const file of files) {
  const code = file.replace("nav_", "").replace(".json", "");

  const amfiFile = `${AMFI_DIR}/${file}`;
  const yahooFile = `${YAHOO_DIR}/${code}.json`;

  if (!fs.existsSync(amfiFile)) continue;

  const amfi = JSON.parse(fs.readFileSync(amfiFile));
  const yahoo = fs.existsSync(yahooFile)
    ? JSON.parse(fs.readFileSync(yahooFile))
    : [];

  const map = new Map();

  // AMFI has priority
  for (const d of amfi) {
    map.set(d.date, { ...d, source: "AMFI" });
  }

  // Yahoo fills gaps
  for (const d of yahoo) {
    if (!map.has(d.date)) {
      map.set(d.date, { ...d, source: "YAHOO" });
    }
  }

  const merged = [...map.values()].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  fs.writeFileSync(
    `${OUT_DIR}/nav_${code}.json`,
    JSON.stringify(merged, null, 2)
  );
}

console.log("✅ NAV reconciliation complete");
