INSTALL sqlite;
LOAD sqlite;

ATTACH 'funds.db' AS mf (TYPE sqlite);

-- ======================
-- Create DuckDB tables
-- ======================

CREATE TABLE amc_duckdb AS
SELECT
  amc_code,
  amc_name
FROM mf.amc;

CREATE TABLE mf_schemes_duckdb AS
SELECT
  scheme_code,
  scheme_name,
  category,
  sub_category,
  amc_code,
  launch_date,
  isin
FROM mf.scheme;

CREATE TABLE mf_nav_history_duckdb AS
SELECT
  scheme_code,
  date AS nav_date,
  nav
FROM mf.nav;
