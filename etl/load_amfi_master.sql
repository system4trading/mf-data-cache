-- ============================
-- Load AMFI Scheme Master
-- Source: NAVAll.txt (pipe-delimited)
-- ============================

CREATE OR REPLACE TEMP TABLE amfi_master_stage AS
SELECT
  CAST(column0 AS INTEGER) AS scheme_code,
  column1 AS isin_payout,
  column2 AS isin_reinvest,
  column3 AS scheme_name,
  NULL AS amc_code,
  column4 AS amc_name,
  column5 AS scheme_type,
  column6 AS scheme_category,
  column7 AS plan,
  column8 AS option,
  TRY_STRPTIME(column9, '%d-%b-%Y')::DATE AS launch_date,
  TRY_STRPTIME(column10, '%d-%b-%Y')::DATE AS closure_date
FROM read_csv_auto(
  'raw/navall/NAVAll.txt',
  delim='|',
  header=false,
  ignore_errors=true
)
WHERE column0 NOT IN ('Scheme Code', '');

-- Clear raw table
DELETE FROM amfi_master_raw;

-- Insert clean data
INSERT INTO amfi_master_raw
SELECT * FROM amfi_master_stage;
