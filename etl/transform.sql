INSERT INTO mf_nav_history
SELECT
  scheme_code,
  nav_date,
  nav
FROM nav_raw
WHERE scheme_code IN (SELECT scheme_code FROM mf_schemes)
ON CONFLICT DO NOTHING;
