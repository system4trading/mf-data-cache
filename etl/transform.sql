-- =========================================
-- DuckDB: Transform & clean NAV data
-- =========================================

DROP TABLE IF EXISTS nav_clean;

CREATE TABLE nav_clean AS
SELECT
  scheme_code,
  nav_date,
  nav
FROM nav_raw
WHERE
  nav > 0
  AND nav_date IS NOT NULL;

-- -----------------------------------------
-- Dedup (keep latest if duplicates exist)
-- -----------------------------------------
DELETE FROM nav_clean
USING (
  SELECT
    scheme_code,
    nav_date,
    COUNT(*) AS cnt
  FROM nav_clean
  GROUP BY scheme_code, nav_date
  HAVING COUNT(*) > 1
) d
WHERE
  nav_clean.scheme_code = d.scheme_code
  AND nav_clean.nav_date = d.nav_date
  AND rowid NOT IN (
    SELECT MIN(rowid)
    FROM nav_clean
    GROUP BY scheme_code, nav_date
  );

-- -----------------------------------------
-- Sanity check
-- -----------------------------------------
SELECT COUNT(*) AS nav_rows_cleaned FROM nav_clean;
