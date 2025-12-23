import fs from "fs";
import fetch from "node-fetch";
import crypto from "crypto";

const SYMBOL = "^NSEI";
const OUT_DIR = "nifty";
const OUT_FILE = `${OUT_DIR}/nifty50.json`;

const RANGE = "5y";
const INTERVAL = "1d";

const URL = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
  SYMBOL
)}?range=${RANGE}&interval=${INTERVAL}&events=div%7Csplit`;

async function fetchWithRetry(url, retries = 3) {
  for (let i = 1; i <= retries; i++) {
    try {
      const res = await fetch(url, { timeout: 15000 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Retry ${i}/${retries} failed`);
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 2000 * i));
    }
  }
}

console.log("📊 Fetching Nifty 50 data…");

const json = await fetchWithRetry(URL);

// ---------- VALIDATION ----------
if (!json.chart || !json.chart.result || !json.chart.result[0]) {
  throw new Error("Invalid Yahoo Finance response");
}

const result = json.chart.result[0];
const timestamps = result.timestamp;
const closes = result.indicators?.quote?.[0]?.close;

if (!timestamps || !closes || timestamps.length !== closes.length) {
  throw new Error("Malformed Nifty data");
}

// ---------- BUILD DATA ----------
const data = [];

for (let i = 0; i < timestamps.length; i++) {
  const close = closes[i];
  if (close === null || isNaN(close)) continue;

  const date = new Date(timestamps[i] * 1000)
    .toISOString()
    .slice(0, 10);

  data.push({
    date,
    close: Number(close.toFixed(2))
  });
}

data.sort((a, b) => a.date.localeCompare(b.date));

if (data.length < 1000) {
  throw new Error("Suspiciously small Nifty dataset");
}

// ---------- CHANGE DETECTION ----------
fs.mkdirSync(OUT_DIR, { recursive: true });

const newHash = crypto
  .createHash("sha256")
  .update(JSON.stringify(data))
  .digest("hex");

if (fs.existsSync(OUT_FILE)) {
  const old = fs.readFileSync(OUT_FILE, "utf8");
  const oldHash = crypto.createHash("sha256").update(old).digest("hex");

  if (newHash === oldHash) {
    console.log("✅ Nifty unchanged — skipping write");
    process.exit(0);
  }
}

// ---------- WRITE ----------
fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2));

console.log(`✅ Nifty50 updated: ${data.length} records`);
