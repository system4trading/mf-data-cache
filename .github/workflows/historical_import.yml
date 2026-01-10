name: Historical MF Import

on:
  workflow_dispatch:

jobs:
  import:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y zstd postgresql-client

      - name: Install DuckDB
        run: |
          curl -L https://github.com/duckdb/duckdb/releases/download/v0.10.2/duckdb-linux-amd64.zip -o duckdb.zip
          unzip duckdb.zip
          chmod +x duckdb
          sudo mv duckdb /usr/local/bin/

      - name: Run DuckDB ETL
        run: |
          chmod +x etl/run_etl.sh
          ./etl/run_etl.sh

      - name: Load CSVs into Supabase
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: |
          psql "$SUPABASE_DB_URL" <<EOF
          \copy amc FROM 'export/amc.csv' CSV HEADER
          \copy mf_schemes FROM 'export/mf_schemes.csv' CSV HEADER
          \copy mf_nav_history FROM 'export/mf_nav_history.csv' CSV HEADER
          EOF
