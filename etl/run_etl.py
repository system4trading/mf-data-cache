import os
import duckdb

DB_PATH = "analytics.duckdb"

SQL_STEPS = [
    "etl/duckdb_schema.sql",                 # creates schema + tables
    "etl/load_funds_master_from_sqlite.sql",
    "etl/load_nav_history.sql",
    "etl/transform.sql",
    "etl/export_to_csv.sql",
]

def run_sql(con, path):
    print(f"▶ Running {path}")
    with open(path, "r", encoding="utf-8") as f:
        con.execute(f.read())

def main():
    print("🦆 Starting DuckDB ETL")

    # Fresh DB each run
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    con = duckdb.connect(DB_PATH)

    try:
        # 1️⃣ Create schema & tables FIRST
        run_sql(con, "etl/duckdb_schema.sql")

        # 2️⃣ Now set default schema
        con.execute("SET schema='core'")

        # 3️⃣ Run remaining steps
        for sql in SQL_STEPS[1:]:
            if not os.path.exists(sql):
                raise FileNotFoundError(f"Missing SQL file: {sql}")
            run_sql(con, sql)

        print("✅ ETL complete")

    finally:
        con.close()

if __name__ == "__main__":
    main()
