import fs from "fs";

const URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const OUT = "amfi/NAVAll.txt";

console.log("📥 Downloading AMFI NAVAll.txt");

const res = await fetch(URL, {
  headers: {
    "User-Agent": "Mozilla/5.0"
  }
});

if (!res.ok) {
  throw new Error("AMFI download failed");
}

const text = await res.text();

fs.mkdirSync("amfi", { recursive: true });
fs.writeFileSync(OUT, text, "utf8");

console.log("✅ NAVAll.txt downloaded");
