-- =========================================
-- DuckDB: Export NAV data to CSV
-- =========================================

COPY nav_clean
TO 'export/mf_nav_history.csv'
(HEADER true, DELIMITER ',');
