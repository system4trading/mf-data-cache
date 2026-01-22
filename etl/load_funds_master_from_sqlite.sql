-- =========================================================
-- Load AMFI Scheme Master from captn3m0 funds.db (SQLite)
-- =========================================================

-- Attach SQLite database
ATTACH 'funds.db' (TYPE SQLITE);

-- ---------------------------------------------------------
-- AMC MASTER
-- ---------------------------------------------------------
INSERT INTO amc (amc_code, amc_name)
SELECT DISTINCT
    amc_code,
    amc_name
FROM amc
WHERE amc_code IS NOT NULL
  AND amc_name IS NOT NULL;

-- ---------------------------------------------------------
-- MF SCHEME MASTER
-- ---------------------------------------------------------
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
SELECT DISTINCT
    scheme_code,
    scheme_name,
    scheme_type,
    scheme_category,
    plan,
    option,
    amc_code,
    launch_date
FROM mf_schemes
WHERE scheme_code IS NOT NULL;

-- ---------------------------------------------------------
-- Cleanup
-- ---------------------------------------------------------
DETACH 'funds.db' (TYPE SQLITE);
