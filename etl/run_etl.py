import duckdb
from pathlib import Path

con = duckdb.connect("analytics.duckdb")

sql_files = [
    "etl/duckdb_schema.sql",        # 👈 MUST be first
    "etl/load_funds_master_from_sqlite.sql",
    "etl/load_nav_history.sql",
    "etl/transform.sql",
    "etl/export_to_csv.sql"
]

SELECT 'amc', COUNT(*) FROM amc
UNION ALL
SELECT 'mf_schemes', COUNT(*) FROM mf_schemes;

for sql in sql_files:
    print(f"▶ Running {sql}")
    with open(sql) as f:
        con.execute(f.read())

con.close()
print("✅ ETL complete")
