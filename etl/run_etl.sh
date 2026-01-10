#!/bin/bash
set -e

echo "🧹 Cleaning DuckDB artifacts"
rm -f analytics.duckdb analytics.duckdb.wal

echo "⬇️ Downloading funds.db"
wget -q https://github.com/captn3m0/historical-mf-data/releases/latest/download/funds.db.zst
unzstd -q funds.db.zst

echo "🦆 Creating DuckDB database"
duckdb analytics.duckdb < etl/load_funds_db.sql

echo "🔄 Transforming data"
duckdb analytics.duckdb < etl/transform.sql

echo "📤 Exporting CSVs"
duckdb analytics.duckdb < etl/export_to_csv.sql

echo "🧹 Cleanup"
rm -f funds.db funds.db.zst analytics.duckdb analytics.duckdb.wal

echo "✅ ETL completed"
