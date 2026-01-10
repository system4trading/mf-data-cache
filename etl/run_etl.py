import duckdb
import os
import subprocess

print("⬇️ Downloading funds.db")
subprocess.run(
    "wget -q https://github.com/captn3m0/historical-mf-data/releases/latest/download/funds.db.zst",
    shell=True,
    check=True
)
subprocess.run("unzstd -q funds.db.zst", shell=True, check=True)

print("🦆 Creating DuckDB database")
con = duckdb.connect(database="analytics.duckdb")

for sql_file in [
    "etl/load_funds_db.sql",
    "etl/transform.sql",
    "etl/export_to_csv.sql",
]:
    print(f"▶ Running {sql_file}")
    with open(sql_file, "r") as f:
        con.execute(f.read())

con.close()

print("🧹 Cleanup")
os.remove("funds.db")
os.remove("funds.db.zst")
os.remove("analytics.duckdb")

print("✅ ETL complete")
