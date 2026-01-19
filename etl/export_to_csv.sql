COPY (
  SELECT * FROM core.amc
) TO 'export/amc.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM core.mf_schemes
) TO 'export/mf_schemes.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM core.mf_nav_history
) TO 'export/mf_nav_history.csv' (HEADER, DELIMITER ',');
