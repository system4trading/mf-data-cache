INSTALL sqlite;
LOAD sqlite;

-- Attach SQLite database
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- AMC master
CREATE TABLE amc AS
SELECT DISTINCT
  amc_code,
  amc_name
FROM mf.amcs;

-- Scheme master
CREATE TABLE mf_schemes AS
SELECT
  scheme_code,
  scheme_name,
  category,
  sub_category,
  amc_code,
  launch_date,
  isin
FROM mf.schemes;

-- NAV history
CREATE TABLE mf_nav_history AS
SELECT
  scheme_code,
  date AS nav_date,
  nav
FROM mf.nav;
