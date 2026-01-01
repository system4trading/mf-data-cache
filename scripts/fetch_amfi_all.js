// scripts/fetch_amfi_all.js
import fs from "fs";
import https from "https";

const URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const OUT_DIR = "mf-data-cache/tree/main/amfi";
const OUT_FILE = `${OUT_DIR}/NAVAll.txt`;

fs.mkdirSync(OUT_DIR, { recursive: true });

console.log("📥 Downloading AMFI NAVAll.txt...");

https.get(URL, res => {
  if (res.statusCode !== 200) {
    console.error(`❌ AMFI download failed: ${res.statusCode}`);
    process.exit(1);
  }

  const stream = fs.createWriteStream(OUT_FILE);
  res.pipe(stream);

  stream.on("finish", () => {
    stream.close();
    console.log("✅ AMFI NAVAll.txt saved");
  });
}).on("error", err => {
  console.error("❌ AMFI download error:", err.message);
  process.exit(1);
});
