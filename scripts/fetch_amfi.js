import fs from "fs";
import fetch from "node-fetch";
import readline from "readline";

const url = "https://www.amfiindia.com/spages/NAVAll.txt";

const res = await fetch(url);
const rl = readline.createInterface({
  input: res.body,
  crlfDelay: Infinity
});

fs.mkdirSync("amfi", { recursive: true });

const cache = {};

for await (const line of rl) {
  const p = line.split(";");
  if (p.length > 4 && !isNaN(p[0])) {
    const code = p[0];
    const nav = Number(p[4]);
    const date = p[7];

    if (!cache[code]) cache[code] = [];
    cache[code].push({ date, nav });
  }
}

for (const code in cache) {
  fs.writeFileSync(
    `amfi/nav_${code}.json`,
    JSON.stringify(cache[code])
  );
}

console.log("AMFI NAV processed safely");
