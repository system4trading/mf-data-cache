import fs from "fs";

const raw = fs.readFileSync("amfi/NAVAll.txt", "utf8");

const lines = raw.split("\n").slice(1);
const map = {};

for (const line of lines) {
  const [code, , nav, date] = line.split(";");

  if (!code || !nav || nav === "N.A.") continue;

  if (!map[code]) map[code] = [];

  map[code].push({
    date: date.trim(),
    nav: Number(nav)
  });
}

fs.mkdirSync("data/nav", { recursive: true });

for (const code in map) {
  fs.writeFileSync(
    `data/nav/nav_${code}.json`,
    JSON.stringify(map[code], null, 2)
  );
}

console.log(`✅ Built NAV history for ${Object.keys(map).length} schemes`);
