-- AMC
CREATE OR REPLACE TABLE amc AS
SELECT
  dense_rank() OVER (ORDER BY amc_name) AS amc_code,
  amc_name
FROM (
  SELECT DISTINCT amc_name
  FROM amfi_master_raw
) t;

-- Schemes
CREATE OR REPLACE TABLE mf_schemes AS
SELECT
  r.scheme_code,
  r.scheme_name,
  r.scheme_type,
  r.scheme_category AS category,
  r.plan,
  r.option,
  a.amc_code,
  r.launch_date
FROM amfi_master_raw r
JOIN amc a USING (amc_name);
