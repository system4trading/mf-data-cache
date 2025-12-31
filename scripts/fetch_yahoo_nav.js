import fs from "fs";

const MASTER = JSON.parse(fs.readFileSync("mf_master.json", "utf8"));
const OUT = "yahoo";

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

for (const s of MASTER) {
  if (!s.yahoo) continue;

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${s.yahoo}?range=1y`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    const exists = !!json?.chart?.result?.[0];

    fs.writeFileSync(
      `${OUT}/validate_${s.code}.json`,
      JSON.stringify({ yahoo: s.yahoo, exists }, null, 2)
    );
  } catch {
    console.warn(`⚠️ Yahoo validation failed: ${s.code}`);
  }
}
