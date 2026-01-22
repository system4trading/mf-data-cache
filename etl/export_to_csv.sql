COPY (
  SELECT * FROM amc
) TO 'export/amc.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM mf_schemes
) TO 'export/mf_schemes.csv' (HEADER, DELIMITER ',');

COPY (
  SELECT * FROM mf_nav_history
) TO 'export/mf_nav_history.csv' (HEADER, DELIMITER ',');
