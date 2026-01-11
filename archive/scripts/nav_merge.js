import fs from "fs";
import path from "path";

const AMFI_DIR = "amfi";
const YAHOO_DIR = "yahoo";
const OUT_DIR = "nav_merged";

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const amfiFiles = fs
  .readdirSync(AMFI_DIR)
  .filter(f => f.startsWith("nav_") && f.endsWith(".json"));

for (const file of amfiFiles) {
  const code = file.replace("nav_", "").replace(".json", "");

  const amfiPath = path.join(AMFI_DIR, file);
  const yahooPath = path.join(YAHOO_DIR, `nav_${code}.json`);
  const outPath = path.join(OUT_DIR, `nav_${code}.json`);

  let amfi = [];
  let yahoo = [];

  try {
    amfi = JSON.parse(fs.readFileSync(amfiPath, "utf8"));
  } catch {
    console.warn(`⚠️ Invalid AMFI JSON for ${code}`);
  }

  if (fs.existsSync(yahooPath)) {
    try {
      yahoo = JSON.parse(fs.readFileSync(yahooPath, "utf8"));
    } catch {
      console.warn(`⚠️ Invalid Yahoo JSON for ${code}`);
    }
  }

  // Merge by date (AMFI wins)
  const map = new Map();

  for (const r of yahoo) {
    map.set(r.date, r.nav);
  }

  for (const r of amfi) {
    map.set(r.date, r.nav);
  }

  const merged = [...map.entries()]
    .map(([date, nav]) => ({ date, nav }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!merged.length) {
    console.warn(`⚠️ No merged data for ${code}`);
    continue;
  }

  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`✅ Merged NAV: ${code} (${merged.length} records)`);
}

console.log("🏁 NAV merge complete");
