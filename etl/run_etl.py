import duckdb
import pathlib

con = duckdb.connect("analytics.duckdb")

sql_files = [
    "etl/load_amfi_master.sql",
    "etl/load_nav.sql",
    "etl/transform.sql",
    "etl/export_to_csv.sql",
]

for sql in sql_files:
    print(f"▶ Running {sql}")
    with open(sql) as f:
        con.execute(f.read())

con.close()
print("✅ ETL complete")
