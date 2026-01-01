import fs from "fs";
import https from "https";

const BASE = "https://www.advisorkhoj.com/mutual-funds-research/historical-NAV/";
const OUT_DIR = "amfi/nav";

const schemes = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));

fs.mkdirSync(OUT_DIR, { recursive: true });

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => resolve(data));
    }).on("error", reject);
  });
}

for (const s of schemes) {
  const file = `${OUT_DIR}/nav_${s.code}.json`;
  if (fs.existsSync(file)) continue;

  const slug = s.name.replace(/\s+/g, "-").toLowerCase();
  const url = BASE + slug;

  console.log(`📜 Backfilling ${s.code}`);

  try {
    const html = await fetchHTML(url);
    const rows = [...html.matchAll(/<tr>.*?<td>(.*?)<\/td>.*?<td>(.*?)<\/td>/g)];

    const history = rows.map(r => ({
      date: r[1].trim(),
      nav: Number(r[2])
    })).filter(r => !isNaN(r.nav));

    if (history.length > 10) {
      fs.writeFileSync(file, JSON.stringify(history, null, 2));
      console.log(`✅ Saved ${history.length} rows`);
    }
  } catch {
    console.warn(`⚠️ Failed ${s.code}`);
  }

  await new Promise(r => setTimeout(r, 3000)); // VERY IMPORTANT
}
