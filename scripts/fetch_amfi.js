import fs from "fs";
import fetch from "node-fetch";

const schemes = JSON.parse(
  fs.readFileSync("data/mf_master.json", "utf8")
);

// Limit per run (VERY IMPORTANT)
const BATCH_SIZE = 30;

async function fetchSchemeHistory(code) {
  const url = "https://www.amfiindia.com/DownloadNAVHistoryReport_Po.aspx";

  const formData = new URLSearchParams({
    mf: "",
    sc: code,
    fdate: "01-Apr-2010",
    tdate: new Date().toLocaleDateString("en-GB")
  });

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0"
    }
  });

  const text = await res.text();
  if (!text.includes(";")) return null;

  const lines = text.split("\n").slice(1);
  return lines
    .map(l => l.split(";"))
    .filter(r => r.length >= 5)
    .map(r => ({
      date: r[0],
      nav: parseFloat(r[4])
    }))
    .filter(r => !isNaN(r.nav));
}

(async () => {
  let count = 0;

  for (const s of schemes) {
    if (count >= BATCH_SIZE) break;

    const outFile = `data/amfi/nav_${s.code}.json`;
    if (fs.existsSync(outFile)) continue;

    console.log(`📥 Fetching AMFI NAV history: ${s.code}`);
    const data = await fetchSchemeHistory(s.code);

    if (data && data.length > 100) {
      fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
      count++;
    }

    await new Promise(r => setTimeout(r, 3000)); // throttle
  }

  console.log(`✅ AMFI batch complete (${count} schemes)`);
})();
