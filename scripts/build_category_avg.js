import fs from "fs";
import path from "path";

const AMFI_DIR = "amfi";
const OUT_FILE = "category_avg.json";

console.log("📊 Building category averages...");

const categoryData = {};

// -------- SAFE JSON READER --------
function safeReadJSON(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8").trim();

    // If file starts with '[' or '{', try direct parse
    if (raw.startsWith("{") || raw.startsWith("[")) {
      return JSON.parse(raw);
    }

    // Otherwise assume line-delimited JSON
    const lines = raw.split("\n").filter(Boolean);
    return lines.map(line => JSON.parse(line));

  } catch (err) {
    console.warn(`⚠️ Skipping invalid JSON file: ${filePath}`);
    return null;
  }
}

// -------- PROCESS EACH AMFI FILE --------
const files = fs.readdirSync(AMFI_DIR).filter(f => f.endsWith(".json"));

for (const file of files) {
  const fullPath = path.join(AMFI_DIR, file);
  const navData = safeReadJSON(fullPath);

  if (!navData || !Array.isArray(navData)) continue;

  for (const row of navData) {
    if (!row.category || !row.nav) continue;

    const cat = row.category.trim();
    categoryData[cat] ??= { sum: 0, count: 0 };

    categoryData[cat].sum += Number(row.nav);
    categoryData[cat].count++;
  }
}

// -------- COMPUTE AVERAGES --------
const result = {};

for (const cat in categoryData) {
  const { sum, count } = categoryData[cat];
  if (count > 0) {
    result[cat] = Number((sum / count).toFixed(4));
  }
}

// -------- WRITE OUTPUT --------
fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
console.log("✅ Category averages built:", Object.keys(result).length);
