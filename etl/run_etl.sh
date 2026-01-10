#!/bin/bash
set -e

echo "🧹 Cleaning previous DuckDB artifacts"
rm -f analytics.duckdb
rm -f analytics.duckdb.wal

echo "🦆 Creating fresh DuckDB database"
duckdb analytics.duckdb <<EOF
INSTALL sqlite;
LOAD sqlite;
INSTALL postgres;
LOAD postgres;

-- Attach SQLite source (funds.db)
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- Attach Supabase Postgres (env var required)
ATTACH '${SUPABASE_DB_URL}' AS pg (TYPE postgres);

-- ===============================
-- LOAD DIMENSIONS
-- ===============================

INSERT INTO pg.amc (amc_code, amc_name)
SELECT DISTINCT amc_code, amc_name
FROM mf.amcs
ON CONFLICT (amc_code) DO NOTHING;

INSERT INTO pg.mf_schemes (
  scheme_code,
  scheme_name,
  category,
  sub_category,
  amc_code,
  launch_date,
  isin
)
SELECT
  scheme_code,
  scheme_name,
  category,
  sub_category,
  amc_code,
  launch_date,
  isin
FROM mf.schemes
ON CONFLICT (scheme_code) DO NOTHING;

-- ===============================
-- LOAD FACT: NAV HISTORY
-- ===============================

INSERT INTO pg.mf_nav_history (scheme_code, nav_date, nav)
SELECT
  scheme_code,
  date,
  nav
FROM mf.nav
ON CONFLICT (scheme_code, nav_date) DO NOTHING;

EOF

echo "🧹 Removing temporary DuckDB files"
rm -f analytics.duckdb
rm -f analytics.duckdb.wal

echo "✅ ETL completed successfully"
