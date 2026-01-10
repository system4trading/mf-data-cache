INSTALL sqlite;
LOAD sqlite;

ATTACH 'funds.db' AS mf (TYPE sqlite);

CREATE TABLE amc AS
SELECT DISTINCT amc_code, amc_name
FROM mf.amcs;

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

CREATE TABLE mf_nav_history AS
SELECT
  scheme_code,
  date AS nav_date,
  nav
FROM mf.nav;
