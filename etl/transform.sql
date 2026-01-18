-- AMC
DELETE FROM amc;

INSERT INTO amc
SELECT
  dense_rank() OVER (ORDER BY amc_name),
  amc_name
FROM (
  SELECT DISTINCT amc_name FROM amfi_master_raw
) t;

-- Schemes
DELETE FROM mf_schemes;

INSERT INTO mf_schemes
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
JOIN amc a ON r.amc_name = a.amc_name;

-- NAV history
DELETE FROM mf_nav_history;

INSERT INTO mf_nav_history
SELECT
  scheme_code,
  nav_date,
  nav
FROM nav_raw;
