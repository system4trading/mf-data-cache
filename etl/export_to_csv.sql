COPY (
  SELECT * FROM analytics.amc
) TO 'export/amc.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM analytics.mf_schemes
) TO 'export/mf_schemes.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM analytics.mf_nav_history
) TO 'export/mf_nav_history.csv' (HEADER, DELIMITER ',');
