def main():
    print("🦆 Starting DuckDB ETL")

    DB_PATH = os.path.abspath("analytics.duckdb")

    con = duckdb.connect(os.path.abspath("analytics.duckdb"))

    try:
        # 1. Create schema + tables
        run_sql(con, "etl/duckdb_schema.sql")

        # 🔒 FORCE schema resolution
        con.execute("SET schema 'core'")

        # 2. Load scheme + AMC master
        run_sql(con, "etl/load_funds_master_from_sqlite.sql")

        # 3. Load NAVs
        run_sql(con, "etl/load_nav_history.sql")

        # 4. Transform
        run_sql(con, "etl/transform.sql")

        # 5. Export
        run_sql(con, "etl/export_to_csv.sql")

        print("✅ ETL complete")

    finally:
        con.close()
