#!/bin/bash
set -e

echo "🧹 Cleaning DuckDB artifacts"
rm -f analytics.duckdb analytics.duckdb.wal

echo "🦆 Creating DuckDB database and loading SQLite"
duckdb analytics.duckdb < etl/load_funds_db.sql

echo "🔄 Transforming data"
duckdb analytics.duckdb < etl/transform.sql

echo "📤 Exporting CSVs"
duckdb analytics.duckdb < etl/export_to_csv.sql

echo "🧹 Cleanup DuckDB files"
rm -f analytics.duckdb analytics.duckdb.wal

echo "✅ ETL finished"
