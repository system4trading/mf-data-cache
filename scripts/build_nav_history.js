// scripts/build_nav_history.js
import fs from "fs";

const NAVALL = "amfi/NAVAll.txt";
const OUT_DIR = "amfi/nav";

if (!fs.existsSync(NAVALL)) {
  console.error("❌ NAVAll.txt missing");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("📥 Processing NAVAll.txt (delta-only)");

const lines = fs.readFileSync(NAVALL, "utf8")
  .split("\n")
  .filter(l => l.includes(";"));

let updated = 0;

for (const line of lines) {
  const [code, , , nav, date] = line.split(";").map(s => s.trim());

  if (!code || isNaN(nav)) continue;

  const file = `${OUT_DIR}/nav_${code}.json`;

  let history = [];
  let lastDate = null;

  if (fs.existsSync(file)) {
    history = JSON.parse(fs.readFileSync(file, "utf8"));
    lastDate = history.at(-1)?.date;
  }

  if (lastDate === date) continue;

  history.push({
    date,
    nav: Number(nav)
  });

  fs.writeFileSync(file, JSON.stringify(history, null, 2));
  updated++;
}

console.log(`✅ NAV updated for ${updated} schemes`);
