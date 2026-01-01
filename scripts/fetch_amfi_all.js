// scripts/fetch_amfi_all.js
import fs from "fs";
import https from "https";

const OUT_DIR = "data/amfi";
const OUT_FILE = `${OUT_DIR}/NAVAll.txt`;

fs.mkdirSync(OUT_DIR, { recursive: true });

const options = {
  hostname: "www.amfiindia.com",
  path: "/spages/NAVAll.txt",
  method: "GET",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120",
    "Accept": "text/plain,*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive"
  }
};

console.log("📥 Downloading AMFI NAVAll.txt...");

function download(urlOptions, redirectCount = 0) {
  if (redirectCount > 5) {
    console.error("❌ Too many redirects");
    process.exit(1);
  }

  https.get(urlOptions, res => {
    // Handle redirect
    if (res.statusCode === 301 || res.statusCode === 302) {
      const location = res.headers.location;
      if (!location) {
        console.error("❌ Redirect without location");
        process.exit(1);
      }

      console.log(`↪ Redirected to ${location}`);

      const newUrl = new URL(location);
      return download(
        {
          hostname: newUrl.hostname,
          path: newUrl.pathname + newUrl.search,
          headers: options.headers
        },
        redirectCount + 1
      );
    }

    if (res.statusCode !== 200) {
      console.error(`❌ AMFI download failed: ${res.statusCode}`);
      process.exit(1);
    }

    const file = fs.createWriteStream(OUT_FILE);
    res.pipe(file);

    file.on("finish", () => {
      file.close();
      console.log("✅ AMFI NAVAll.txt downloaded");
    });
  }).on("error", err => {
    console.error("❌ Download error:", err.message);
    process.exit(1);
  });
}

download(options);
