import fs from "fs";

const master = JSON.parse(fs.readFileSync("mf_master.json"));
const out = {};

function CAGR(p, y) {
  const d = y * 252;
  if (p.length <= d) return null;
  return Math.pow(p.at(-1) / p.at(-1 - d), 1 / y) - 1;
}

master.forEach(mf => {
  const f = `amfi/nav_${mf.code}.json`;
  if (!fs.existsSync(f)) return;

  const nav = JSON.parse(fs.readFileSync(f)).map(x => x.nav);
  const c1 = CAGR(nav, 1);
  const c3 = CAGR(nav, 3);
  const c5 = CAGR(nav, 5);

  if (!out[mf.category]) out[mf.category] = { "1": [], "3": [], "5": [] };
  if (c1) out[mf.category]["1"].push(c1);
  if (c3) out[mf.category]["3"].push(c3);
  if (c5) out[mf.category]["5"].push(c5);
});

const avg = {};
for (const c in out) {
  avg[c] = {};
  ["1", "3", "5"].forEach(y => {
    const a = out[c][y];
    avg[c][y] = a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
  });
}

fs.writeFileSync("category_avg.json", JSON.stringify(avg, null, 2));
console.log("Category averages built");
