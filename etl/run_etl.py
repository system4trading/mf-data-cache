import os
import duckdb

DB_PATH = "analytics.duckdb"

SQL_STEPS = [
    "etl/duckdb_schema.sql",
    "etl/load_funds_master_from_sqlite.sql",
    "etl/load_nav_history.sql",
    "etl/export_to_csv.sql",
]

def run_sql(con, path):
    print(f"▶ Running {path}")
    with open(path, "r", encoding="utf-8") as f:
        con.execute(f.read())

def main():
    print("🦆 Starting DuckDB ETL")

    # IMPORTANT: delete ONCE, at the start
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    con = duckdb.connect(DB_PATH)
    
    try:
        for sql in SQL_STEPS:
            run_sql(con, sql)

        print("\n📊 Final row counts:")
        rows = con.execute("""
            SELECT 'amc', COUNT(*) FROM amc
            UNION ALL
            SELECT 'mf_schemes', COUNT(*) FROM mf_schemes
            UNION ALL
            SELECT 'mf_nav_history', COUNT(*) FROM mf_nav_history;
        """).fetchall()

        for r in rows:
            print(r)

        print("\n✅ ETL complete")

    finally:
        con.close()

if __name__ == "__main__":
    main()
