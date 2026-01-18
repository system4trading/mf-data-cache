-- Read NAVAll.txt with headers
CREATE OR REPLACE TABLE navall_raw AS
SELECT
  "Scheme Code"::INTEGER              AS scheme_code,
  STRPTIME("Date", '%d-%b-%Y')::DATE  AS nav_date,
  "Net Asset Value"::NUMERIC          AS nav
FROM read_csv(
  'raw/navall/NAVAll.txt',
  delim=';',
  header=true,
  ignore_errors=true
)
WHERE
  "Scheme Code" IS NOT NULL
  AND "Net Asset Value" IS NOT NULL;
