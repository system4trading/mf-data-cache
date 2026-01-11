import fs from "fs";

/* ---------------- CONFIG ---------------- */

const MASTER = JSON.parse(fs.readFileSync("mf_master.json"));
const NAV_DIR = "amfi";
const OUT = "category_avg.json";

/* ---------------- BUILD ---------------- */

const categories = {};

for (const s of MASTER) {
  const file = `${NAV_DIR}/nav_${s.code}.json`;
  if (!fs.existsSync(file)) continue;

  const navs = JSON.parse(fs.readFileSync(file));

  if (navs.length < 2) continue;

  for (let i = 1; i < navs.length; i++) {
    const date = navs[i].date;
    const ret = (navs[i].nav - navs[i - 1].nav) / navs[i - 1].nav;

    categories[s.category] ??= {};
    categories[s.category][date] ??= [];

    categories[s.category][date].push(ret);
  }
}

/* ---------------- AVERAGE ---------------- */

const output = {};

for (const [cat, dates] of Object.entries(categories)) {
  output[cat] = Object.entries(dates).map(([date, vals]) => ({
    date,
    avgReturn: vals.reduce((a, b) => a + b, 0) / vals.length
  }));
}

fs.writeFileSync(OUT, JSON.stringify(output, null, 2));

console.log(`✅ Category averages built: ${Object.keys(output).length}`);
