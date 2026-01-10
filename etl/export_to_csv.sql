COPY (
  SELECT
    amc_code,
    amc_name
  FROM amc
) TO 'export/amc.csv'
WITH (HEADER, DELIMITER ',');

COPY (
  SELECT
    scheme_code,
    scheme_name,
    category,
    sub_category,
    amc_code,
    launch_date,
    isin
  FROM mf_schemes
) TO 'export/mf_schemes.csv'
WITH (HEADER, DELIMITER ',');

COPY (
  SELECT
    scheme_code,
    nav_date,
    nav
  FROM mf_nav_history
) TO 'export/mf_nav_history.csv'
WITH (HEADER, DELIMITER ',');
