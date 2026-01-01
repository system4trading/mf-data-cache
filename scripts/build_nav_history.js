import fs from "fs";

const DIR = "amfi";
let updated = 0;

for (const file of fs.readdirSync(DIR)) {
  if (!file.startsWith("nav_") || !file.endsWith(".json")) continue;

  const path = `${DIR}/${file}`;
  const nav = JSON.parse(fs.readFileSync(path));

  if (!Array.isArray(nav) || nav.length === 0) continue;

  nav.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Remove duplicates
  const deduped = [];
  const seen = new Set();

  for (const r of nav) {
    if (!seen.has(r.date)) {
      seen.add(r.date);
      deduped.push(r);
    }
  }

  if (deduped.length !== nav.length) {
    fs.writeFileSync(path, JSON.stringify(deduped, null, 2));
    updated++;
  }
}

console.log(`✅ NAV updated for ${updated} schemes`);
