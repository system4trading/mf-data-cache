-- Load NAV history from NAVAll raw data

INSERT INTO nav_raw (
  scheme_code,
  nav_date,
  nav
)
SELECT
  CAST(column0 AS INTEGER)                     AS scheme_code,
  STRPTIME(column7, '%d-%b-%Y')::DATE          AS nav_date,
  CAST(column4 AS NUMERIC)                     AS nav
FROM navall_raw
WHERE
  column0 ~ '^[0-9]+$'
  AND column4 IS NOT NULL
  AND column4 <> 'N.A.';
