-- AMC
DELETE FROM mf.amc;

INSERT INTO mf.amc
SELECT
  dense_rank() OVER (ORDER BY amc_name),
  amc_name
FROM (
  SELECT DISTINCT amc_name FROM amfi_master_raw
) t;

-- Schemes
DELETE FROM mf.mf_schemes;

INSERT INTO mf.mf_schemes
SELECT
  r.scheme_code,
  r.scheme_name,
  r.scheme_type,
  r.scheme_category,
  r.plan,
  r.option,
  a.amc_code,
  r.launch_date
FROM amfi_master_raw r
JOIN mf.amc a ON r.amc_name = a.amc_name;

-- NAV history
DELETE FROM mf.mf_nav_history;

INSERT INTO mf.mf_nav_history
SELECT
  scheme_code,
  nav_date,
  nav
FROM nav_raw;
