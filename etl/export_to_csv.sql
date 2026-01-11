-- =========================================
-- Export NAV data for Postgres load
-- =========================================

COPY nav_clean
TO 'export/mf_nav_history.csv'
(WITH HEADER, DELIMITER ',');
