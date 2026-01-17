-- Enable SQLite support
INSTALL sqlite;
LOAD sqlite;

-- Attach captn3m0 SQLite database
ATTACH 'funds.db' AS mf (TYPE sqlite);

-- Clear previous load (safe for reruns)
DELETE FROM amfi_master_raw;

-- Insert AMFI scheme master data
INSERT INTO amfi_master_raw (
  scheme_code,
  isin_payout,
  isin_reinvest,
  scheme_name,
  amc_code,
  amc_name,
  scheme_type,
  scheme_category,
  plan,
  option,
  launch_date,
  closure_date
)
SELECT
  scheme_code,
  isin_payout,
  isin_reinvest,
  scheme_name,
  amc_code,
  amc_name,
  scheme_type,
  scheme_category,
  plan,
  option,
  launch_date,
  closure_date
FROM mf.schemes
WHERE scheme_code IS NOT NULL;


