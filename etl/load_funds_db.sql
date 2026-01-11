INSTALL sqlite;
LOAD sqlite;

-- Attach SQLite NAV database
ATTACH 'funds.db' AS mf (TYPE sqlite);

INSERT INTO nav_raw (scheme_code, nav_date, nav)
SELECT
  scheme_code,
  STRPTIME(date, '%Y-%m-%d')::DATE AS nav_date,
  nav
FROM mf.nav
WHERE nav IS NOT NULL;

-- Create working NAV table in DuckDB
CREATE TABLE nav_raw AS
SELECT
  scheme_code::INTEGER,
  date::DATE AS nav_date,
  nav::DOUBLE
FROM mf.nav;

SELECT COUNT(*) AS nav_rows FROM nav_raw;
