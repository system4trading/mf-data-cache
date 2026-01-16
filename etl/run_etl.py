import duckdb
import subprocess
import os
import requests
import zstandard as zstd

DB_ZST = "funds.db.zst"
DB_FILE = "funds.db"

print("⬇️ Downloading funds.db")
url = "https://github.com/captn3m0/historical-mf-data/releases/latest/download/funds.db.zst"
r = requests.get(url, stream=True)
with open(DB_ZST, "wb") as f:
    for chunk in r.iter_content(chunk_size=8192):
        f.write(chunk)

print("📦 Decompressing")
with open(DB_ZST, "rb") as f_in:
    with open(DB_FILE, "wb") as f_out:
        dctx = zstd.ZstdDecompressor()
        dctx.copy_stream(f_in, f_out)

print("🦆 Creating DuckDB database")
con = duckdb.connect("analytics.duckdb")

def run_sql(path):
    print(f"▶ Running {path}")
    with open(path) as f:
        con.execute(f.read())

run_sql("etl/load_funds_db.sql")
run_sql("etl/transform.sql")
run_sql("etl/export_to_csv.sql")

con.close()

print("🧹 Cleanup")
os.remove("analytics.duckdb")
os.remove(DB_FILE)
os.remove(DB_ZST)

print("✅ ETL complete")
