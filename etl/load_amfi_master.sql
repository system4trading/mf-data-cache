-- Read raw NAVAll.txt (no header, semicolon separated)
CREATE OR REPLACE TEMP TABLE navall_raw AS
SELECT *
FROM read_csv(
  'raw/navall/NAVAll.txt',
  delim=';',
  header=false,
  quote='',
  escape='',
  nullstr='',
  ignore_errors=true
);

-- Normalize into raw table
INSERT INTO amfi_master_raw (
  scheme_code,
  isin_payout,
  isin_reinvest,
  scheme_name
)
SELECT
  CAST(column0 AS INTEGER)            AS scheme_code,
  NULLIF(column1, '')                 AS isin_payout,
  NULLIF(column2, '')                 AS isin_reinvest,
  TRIM(column3)                       AS scheme_name
FROM navall_raw
WHERE column0 ~ '^[0-9]+$';
