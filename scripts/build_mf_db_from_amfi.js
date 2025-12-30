import fs from "fs";

/*
 AMFI official scheme master
 This endpoint is stable and publicly used by registrars
*/
const AMFI_URL =
  "https://www.amfiindia.com/spages/NAVAll.txt";

const OUTPUT = "mf_db.json";

/* ---------------- FETCH RAW ---------------- */

async function fetchAMFIMaster() {
  const res = await fetch(AMFI_URL, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  if (!res.ok) {
    throw new Error(`AMFI fetch failed: ${res.status}`);
  }

  return res.text();
}

/* ---------------- PARSE ---------------- */

function parseAMFI(text) {
  const lines = text.split("\n");

  const schemes = [];
  const seen = new Set();

  for (const line of lines) {
    // AMFI format: Scheme Code;ISIN Div Payout/ISIN Growth;ISIN Div Reinvestment;Scheme Name
    const parts = line.split(";");

    if (parts.length < 4) continue;

    const code = parts[0]?.trim();
    const name = parts[3]?.trim();

    if (!code || !name) continue;
    if (seen.has(code)) continue;

    seen.add(code);

    schemes.push({
      code,
      name,
      category: inferCategory(name)
    });
  }

  return schemes;
}

/* ---------------- CATEGORY INFERENCE ---------------- */

function inferCategory(name) {
  const n = name.toLowerCase();

  if (n.includes("large cap")) return "Equity Large Cap";
  if (n.includes("mid cap")) return "Equity Mid Cap";
  if (n.includes("small cap")) return "Equity Small Cap";
  if (n.includes("flexi")) return "Equity Flexi Cap";
  if (n.includes("elss")) return "ELSS";
  if (n.includes("index")) return "Index Fund";
  if (n.includes("liquid")) return "Liquid";
  if (n.includes("short term")) return "Debt Short Term";
  if (n.includes("long duration")) return "Debt Long Term";
  if (n.includes("balanced")) return "Hybrid";
  if (n.includes("hybrid")) return "Hybrid";
  if (n.includes("gold")) return "Gold";
  if (n.includes("overnight")) return "Overnight";

  return "Other";
}

/* ---------------- MAIN ---------------- */

(async () => {
  try {
    console.log("📥 Fetching AMFI scheme master...");
    const raw = await fetchAMFIMaster();

    console.log("🧹 Parsing & cleaning data...");
    const schemes = parseAMFI(raw);

    if (schemes.length === 0) {
      throw new Error("Parsed zero schemes — aborting");
    }

    fs.writeFileSync(
      OUTPUT,
      JSON.stringify(schemes, null, 2)
    );

    console.log(`✅ mf_db.json generated (${schemes.length} schemes)`);
  } catch (e) {
    console.error("❌ Failed to build mf_db.json");
    console.error(e.message);
    process.exit(1);
  }
})();
