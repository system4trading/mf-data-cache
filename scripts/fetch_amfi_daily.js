import fs from "fs";

const AMFI_DAILY_URL = "https://www.amfiindia.com/spages/NAVAll.txt";
const OUT_DIR = "amfi";
const OUT_FILE = `${OUT_DIR}/NAVAll.txt`;

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log("📥 Fetching AMFI NAVAll.txt");

const response = await fetch(AMFI_DAILY_URL);

if (!response.ok) {
  throw new Error(`❌ AMFI fetch failed: ${response.status}`);
}

const text = await response.text();

if (!text.includes("Scheme Code")) {
  throw new Error("❌ Invalid AMFI NAV file format");
}

fs.writeFileSync(OUT_FILE, text, "utf8");

console.log(`✅ AMFI daily NAV saved → ${OUT_FILE}`);
