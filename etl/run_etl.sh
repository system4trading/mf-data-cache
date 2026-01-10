#!/bin/bash
set -e

echo "🧹 Cleaning DuckDB artifacts"
rm -f analytics.duckdb
rm -f analytics.duckdb.wal

echo "🦆 Creating DuckDB database"
duckdb analytics.duckdb <<EOF

INSTALL sqlite;
LOAD sqlite;

INSTALL postgres;
LOAD postgres;

-- Attach SQLite source
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- Attach Postgres target
ATTACH '${SUPABASE_DB_URL}' AS pg (TYPE postgres);

-- Load AMCs
INSERT INTO pg.public.amc (amc_code, amc_name)
SELECT DISTINCT amc_code, amc_name
FROM mf.amcs
ON CONFLICT (amc_code) DO NOTHING;

-- Load Schemes
INSERT INTO pg.public.mf_schemes (
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

-- Load NAV history
INSERT INTO pg.public.mf_nav_history (scheme_code, nav_date, nav)
SELECT
  scheme_code,
  date,
  nav
FROM mf.nav
ON CONFLICT (scheme_code, nav_date) DO NOTHING;

EOF

echo "🧹 Cleanup"
rm -f analytics.duckdb
rm -f analytics.duckdb.wal

echo "✅ ETL complete"
