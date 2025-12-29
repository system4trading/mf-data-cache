import fs from "fs";

const nav = JSON.parse(fs.readFileSync("data/amfi/nav_120503.json"));
let gaps = 0;

for (let i = 1; i < nav.length; i++) {
  const prev = new Date(nav[i - 1].date);
  const curr = new Date(nav[i].date);
  if ((curr - prev) / 86400000 > 5) gaps++;
}

console.log(`⚠️ Missing periods: ${gaps}`);
