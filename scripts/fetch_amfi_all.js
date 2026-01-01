import fs from "fs";

const URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const OUT = "amfi/NAVAll.txt";

fs.mkdirSync("amfi", { recursive: true });

console.log("📥 Downloading NAVAll.txt from AMFI...");

const res = await fetch(URL, {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

if (!res.ok) {
  console.error("❌ Failed to download NAVAll.txt");
  process.exit(1);
}

const text = await res.text();
fs.writeFileSync(OUT, text, "utf8");

console.log("✅ NAVAll.txt downloaded");
