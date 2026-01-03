import fs from "fs";
import { setTimeout as sleep } from "timers/promises";

/* ---------------- CONFIG ---------------- */

const MASTER = "mf_master.json";
const OUT_DIR = "amfi";
const BASE =
  "https://www.advisorkhoj.com/mutual-funds-research/historical-NAV";

const DELAY_MS = 2000;
const RETRIES = 3;

/* ---------------- PREP ---------------- */

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const schemes = JSON.parse(fs.readFileSync(MASTER, "utf8"));
console.log(`📦 Loaded ${schemes.length} schemes`);

/* ---------------- FETCH ---------------- */

async function fetchHistory(code, attempt = 1) {
  try {
    const res = await fetch(`${BASE}/${code}`, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.advisorkhoj.com/"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();

    const rows = [
      ...html.matchAll(
        /<td[^>]*>(\d{2}-[A-Za-z]{3}-\d{4})<\/td>\s*<td[^>]*>([\d.]+)<\/td>/g
      )
    ];

    if (!rows.length) return null;

    return rows
      .map(r => ({
        date: r[1],
        nav: parseFloat(r[2])
      }))
      .reverse();

  } catch {
    if (attempt < 3) {
      await sleep(3000);
      return fetchHistory(code, attempt + 1);
    }
    return null;
  }
}

/* ---------------- MAIN ---------------- */

let built = 0;

for (const s of schemes) {
  const out = `${OUT_DIR}/nav_${s.code}.json`;
  if (fs.existsSync(out)) continue;

  console.log(`📥 Bootstrap NAV: ${s.code}`);

  const data = await fetchHistory(s.code);

  if (!data) {
    console.warn(`⚠️ No history for ${s.code}`);
    continue;
  }

  fs.writeFileSync(out, JSON.stringify(data, null, 2));
  built++;

  await sleep(DELAY_MS);
}

console.log(`✅ Bootstrap complete: ${built} schemes`);
