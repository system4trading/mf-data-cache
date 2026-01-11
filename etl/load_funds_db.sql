-- =========================================
-- DuckDB: Load data from captn3m0 funds.db
-- =========================================

INSTALL sqlite;
LOAD sqlite;

-- Attach the SQLite database
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- -----------------------------------------
-- RAW NAV TABLE (DuckDB temp layer)
-- -----------------------------------------
DROP TABLE IF EXISTS nav_raw;

CREATE TABLE nav_raw (
  scheme_code INTEGER,
  nav_date DATE,
  nav DOUBLE
);

-- -----------------------------------------
-- LOAD NAV DATA (FIXED DATE PARSING)
-- -----------------------------------------
INSERT INTO nav_raw (scheme_code, nav_date, nav)
SELECT
  scheme_code,
  STRPTIME(date, '%Y-%m-%d')::DATE AS nav_date,
  nav
FROM mf.nav
WHERE nav IS NOT NULL;

-- -----------------------------------------
-- SANITY CHECK
-- -----------------------------------------
SELECT COUNT(*) AS nav_rows_loaded FROM nav_raw;
