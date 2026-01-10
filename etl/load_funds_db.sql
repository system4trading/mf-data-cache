INSTALL sqlite;
LOAD sqlite;

ATTACH 'funds.db' AS mf (TYPE sqlite);

-- ======================
-- AMC
-- ======================
INSERT INTO amc (amc_code, amc_name)
SELECT
  amc_code,
  amc_name
FROM mf.amc
ON CONFLICT DO NOTHING;

-- ======================
-- Schemes
-- ======================
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
FROM mf.scheme
ON CONFLICT (scheme_code) DO NOTHING;

-- ======================
-- NAV history
-- ======================
INSERT INTO mf_nav_history (
  scheme_code,
  nav_date,
  nav
)
SELECT
  scheme_code,
  date,
  nav
FROM mf.nav
ON CONFLICT (scheme_code, nav_date) DO NOTHING;
