COPY amfi_master_raw
FROM 'raw/amfi_master.txt'
(DELIMITER '|', HEADER);

INSERT INTO amc (amc_code, amc_name)
SELECT DISTINCT amc_code, amc_name
FROM amfi_master_raw
WHERE amc_code IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO mf_schemes (
  scheme_code,
  scheme_name,
  scheme_type,
  category,
  plan,
  option,
  amc_code,
  launch_date
)
SELECT
  scheme_code,
  scheme_name,
  scheme_type,
  scheme_category,
  plan,
  option,
  amc_code,
  launch_date
FROM amfi_master_raw
WHERE scheme_code IS NOT NULL
ON CONFLICT DO NOTHING;

