import os
import duckdb

# -------------------------------------------------
# Configuration
# -------------------------------------------------
DB_PATH = os.path.abspath("analytics.duckdb")

SQL_STEPS = [
    "etl/duckdb_schema.sql",
    "etl/load_funds_master_from_sqlite.sql",
    "etl/load_nav_history.sql",
    "etl/export_to_csv.sql",
]

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def run_sql(con, path):
    print(f"▶ Running {path}")
    with open(path, "r", encoding="utf-8") as f:
        sql = f.read().strip()
        if not sql:
            raise ValueError(f"{path} is empty")
        con.execute(sql)

# -------------------------------------------------
# Main ETL
# -------------------------------------------------
def main():
    print("🦆 Starting DuckDB ETL")
    print(f"📦 DB Path: {DB_PATH}")

    # Always start fresh (CI-safe)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    con = duckdb.connect(DB_PATH)

    try:
        # Execute pipeline
        for sql in SQL_STEPS:
            if not os.path.exists(sql):
                raise FileNotFoundError(f"Missing SQL file: {sql}")
            run_sql(con, sql)

        # -------------------------------------------------
        # Verification (same connection = guaranteed)
        # -------------------------------------------------
        print("\n📊 Verification counts:")

        rows = con.execute("""
            SELECT 'core.amc', COUNT(*) FROM core.amc
            UNION ALL
            SELECT 'core.mf_schemes', COUNT(*) FROM core.mf_schemes
            UNION ALL
            SELECT 'core.mf_nav_history', COUNT(*) FROM core.mf_nav_history;
        """).fetchall()

        for r in rows:
            print(f"  {r[0]} → {r[1]:,}")

        print("\n✅ DuckDB ETL completed successfully")

    finally:
        con.close()

# -------------------------------------------------
# Entrypoint
# -------------------------------------------------
if __name__ == "__main__":
    main()
