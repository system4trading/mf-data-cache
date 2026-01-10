COPY amc_duckdb TO 'export/amc.csv' (HEADER, DELIMITER ',');
COPY mf_schemes_duckdb TO 'export/mf_schemes.csv' (HEADER, DELIMITER ',');
COPY mf_nav_history_duckdb TO 'export/mf_nav_history.csv' (HEADER, DELIMITER ',');
