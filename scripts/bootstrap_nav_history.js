import fs from "fs";
import fetch from "node-fetch";
import { setTimeout as sleep } from "timers/promises";

/* ---------------- CONFIG ---------------- */

const MASTER_FILE = "mf_master.json";
const OUT_DIR = "amfi";
const BASE_URL =
  "https://www.advisorkhoj.com/mutual-funds-research/historical-NAV";

const DELAY_MS = 1500;       // polite scraping
const RETRIES = 3;

/* ---------------- PREP ---------------- */

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const schemes = JSON.parse(fs.readFileSync(MASTER_FILE, "utf8"));

console.log(`📦 Loaded ${schemes.length} schemes`);

/* ---------------- HELPERS ---------------- */

async function fetchHistory(code, attempt = 1) {
  const url = `${BASE_URL}/${code}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    // Extract table rows
    const rows = [...html.matchAll(/<tr>\s*<td>(\d{2}-\w{3}-\d{4})<\/td>\s*<td>([\d.]+)<\/td>/g)];

    if (!rows.length) return null;

    return rows.map(r => ({
      date: r[1],
      nav: parseFloat(r[2])
    })).reverse(); // oldest → newest

  } catch (e) {
    if (attempt < RETRIES) {
      await sleep(2000);
      return fetchHistory(code, attempt + 1);
    }
    return null;
  }
}

/* ---------------- MAIN ---------------- */

let built = 0;

for (const s of schemes) {
  const file = `${OUT_DIR}/nav_${s.code}.json`;

  if (fs.existsSync(file)) continue;

  console.log(`📥 Bootstrap NAV: ${s.code}`);

  const data = await fetchHistory(s.code);

  if (!data) {
    console.warn(`⚠️ No history for ${s.code}`);
    continue;
  }

  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  built++;

  await sleep(DELAY_MS);
}

console.log(`✅ Bootstrap complete: ${built} schemes`);
