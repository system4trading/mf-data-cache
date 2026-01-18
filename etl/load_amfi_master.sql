-- Read raw AMFI master
CREATE OR REPLACE TABLE amfi_master_raw AS
SELECT
  column0::INTEGER          AS scheme_code,
  column1                  AS isin_payout,
  column2                  AS isin_reinvest,
  column3                  AS scheme_name,
  column4                  AS amc_name,
  column5                  AS scheme_type,
  column6                  AS scheme_category,
  column7                  AS plan,
  column8                  AS option,
  STRPTIME(column9, '%d-%b-%Y')::DATE AS launch_date
FROM read_csv(
  'raw/amfi/MFMaster.txt',
  delim='|',
  header=false
)
WHERE column0 IS NOT NULL;
