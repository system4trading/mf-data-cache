import fs from "fs";

const FILE = "amfi/NAVAll.txt";

if (!fs.existsSync(FILE)) {
  console.error("❌ NAVAll.txt missing. Did fetch_amfi_daily.js run?");
  process.exit(1);
}

const raw = fs.readFileSync(FILE, "utf8");
const lines = raw.split("\n");

const navMap = {};

for (const line of lines) {
  if (!line.includes(";")) continue;

  const [code, name, nav, date] = line.split(";");

  if (!code || !nav || !date) continue;
  if (isNaN(parseFloat(nav))) continue;

  navMap[code] ??= [];
  navMap[code].push({ date, nav: +nav });
}

if (!fs.existsSync("amfi")) fs.mkdirSync("amfi");

for (const code in navMap) {
  fs.writeFileSync(
    `amfi/nav_${code}.json`,
    JSON.stringify(navMap[code], null, 2)
  );
}

console.log(`✅ Built NAV history for ${Object.keys(navMap).length} schemes`);
