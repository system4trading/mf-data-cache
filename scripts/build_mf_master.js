import fs from "fs";
import fetch from "node-fetch";

const raw = JSON.parse(fs.readFileSync("mf_db.json"));
const result = [];

async function validateYahoo(symbol) {
  try {
    const r = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    );
    const j = await r.json();
    return !!j.chart?.result;
  } catch {
    return false;
  }
}

for (const s of raw) {
  const yahoo = `${s.code}.BO`;
  const valid = await validateYahoo(yahoo);

  result.push({
    code: s.code,
    name: s.name.trim(),
    category: s.category,
    yahoo: valid ? yahoo : null
  });

  await new Promise(r => setTimeout(r, 200)); // throttle
}

fs.writeFileSync(
  "mf_master.json",
  JSON.stringify(result, null, 2)
);

console.log("✅ mf_master.json validated and built");
