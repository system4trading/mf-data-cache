import fs from "fs";

const raw = fs.readFileSync("mf_db.json", "utf8");
const schemes = JSON.parse(raw);

const master = schemes.map(s => ({
  code: s.code,
  name: s.name,
  category: s.category,
  amfiCategory: s.amfiCategory || s.category,
  yahoo: `${s.code}.BO`
}));

fs.writeFileSync(
  "mf_master.json",
  JSON.stringify(master, null, 2)
);

console.log("✅ mf_master.json built with Yahoo symbols");
