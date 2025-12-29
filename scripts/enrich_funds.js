import fs from "fs";

const master = JSON.parse(fs.readFileSync("data/mf_master.json"));

const enrichment = master.map(f => ({
  code: f.code,
  manager: "Unknown",          // Replace later with real sources
  tenure: Math.floor(Math.random() * 10) + 1,
  aumTrend: [
    Math.random() * 10000,
    Math.random() * 12000,
    Math.random() * 15000
  ]
}));

fs.writeFileSync(
  "data/fund_enrichment.json",
  JSON.stringify(enrichment, null, 2)
);

console.log("✅ Fund enrichment built");
