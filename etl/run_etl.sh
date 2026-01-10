#!/bin/bash
set -e

echo "🧹 Cleaning DuckDB artifacts"
rm -f analytics.duckdb
rm -rf export
mkdir -p export

echo "🦆 Creating DuckDB database"
duckdb analytics.duckdb <<EOF
INSTALL sqlite;
LOAD sqlite;

ATTACH 'funds.db' AS mf (TYPE sqlite);

-- AMC
COPY (
  SELECT DISTINCT amc_code, amc_name
  FROM mf.amcs
) TO 'export/amc.csv' (HEADER, DELIMITER ',');

-- Schemes
COPY (
  SELECT
    scheme_code,
    scheme_name,
    category,
    sub_category,
    amc_code,
    launch_date,
    isin
  FROM mf.schemes
) TO 'export/mf_schemes.csv' (HEADER, DELIMITER ',');

-- NAV history
COPY (
  SELECT
    scheme_code,
    date AS nav_date,
    nav
  FROM mf.nav
) TO 'export/mf_nav_history.csv' (HEADER, DELIMITER ',');

EOF

echo "✅ DuckDB export complete"
