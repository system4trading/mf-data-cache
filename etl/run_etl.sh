#!/bin/bash
set -e

duckdb analytics.duckdb <<EOF
INSTALL sqlite;
LOAD sqlite;

-- Attach SQLite source
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- Load AMCs
INSERT INTO amc (amc_code, amc_name)
SELECT DISTINCT amc_code, amc_name
FROM mf.amcs
ON CONFLICT DO NOTHING;

-- Load Schemes
INSERT INTO mf_schemes (
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
INSERT INTO nav_history (scheme_code, nav_date, nav)
SELECT
  scheme_code,
  date,
  nav
FROM mf.nav
ON CONFLICT (scheme_code, nav_date) DO NOTHING;

EOF
