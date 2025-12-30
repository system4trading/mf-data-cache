import fs from "fs";

const amfiDaily = fs.readFileSync("amfi/nav_daily.txt", "utf8");
const lines = amfiDaily.split("\n");

const latest = {};
for (const l of lines) {
  const p = l.split(";");
  if (p.length < 6) continue;

  const code = p[0];
  const nav = parseFloat(p[4]);
  const date = p[5];

  if (!isNaN(nav)) {
    latest[code] = { date, nav };
  }
}

fs.mkdirSync("amfi", { recursive: true });

for (const file of fs.readdirSync("yahoo")) {
  const code = file.match(/\d+/)[0];
  const yahoo = JSON.parse(fs.readFileSync(`yahoo/${file}`, "utf8"));

  const amfi = latest[code];
  if (amfi) {
    const last = yahoo[yahoo.length - 1];
    if (!last || last.date !== amfi.date) {
      yahoo.push(amfi);
    } else {
      last.nav = amfi.nav; // AMFI wins
    }
  }

  fs.writeFileSync(
    `amfi/nav_${code}.json`,
    JSON.stringify(yahoo, null, 2)
  );

  console.log(`🔗 NAV merged: ${code}`);
}

console.log("✅ AMFI + Yahoo NAV reconciliation complete");
