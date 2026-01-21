import os
import duckdb

# -------------------------------------------------
# Absolute path to avoid CI / working-directory bugs
# -------------------------------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "analytics.duckdb"))

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
    print(f"📁 Using DB file: {DB_PATH}")

    # Always start fresh
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    con = duckdb.connect(DB_PATH)

    try:
        for sql in SQL_STEPS:
            if not os.path.exists(sql):
                raise FileNotFoundError(f"Missing SQL file: {sql}")
            run_sql(con, sql)

        # -------------------------------
        # Sanity check (critical)
        # -------------------------------
        print("🔍 Row count check")
        rows = con.execute("""
            SELECT 'core.amc' AS table_name, COUNT(*) FROM core.amc
            UNION ALL
            SELECT 'core.mf_schemes', COUNT(*) FROM core.mf_schemes
            UNION ALL
            SELECT 'core.mf_nav_history', COUNT(*) FROM core.mf_nav_history
        """).fetchall()

        for r in rows:
            print(r)

        print("✅ ETL complete")

    finally:
        con.close()

if __name__ == "__main__":
    main()
