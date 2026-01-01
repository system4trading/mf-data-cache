import fs from "fs";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json"));
const DIR = "amfi";
const out = {};

for (const s of MASTER) {
  const file = `${DIR}/nav_${s.code}.json`;
  if (!fs.existsSync(file)) continue;

  const nav = JSON.parse(fs.readFileSync(file));
  if (nav.length < 200) continue;

  const ret =
    nav[nav.length - 1].nav / nav[0].nav - 1;

  if (!out[s.category]) out[s.category] = [];
  out[s.category].push(ret);
}

const avg = {};
for (const k in out) {
  avg[k] = out[k].reduce((a, b) => a + b, 0) / out[k].length;
}

fs.writeFileSync("category_avg.json", JSON.stringify(avg, null, 2));
console.log(`✅ Category averages built: ${Object.keys(avg).length}`);
