-- ---------------------------------------------------------
-- Load AMFI Scheme Master from captn3m0 funds.db (SQLite)
-- Source: https://github.com/captn3m0/historical-mf-data
-- ---------------------------------------------------------

-- Attach the SQLite database
ATTACH 'funds.db' AS src (TYPE SQLITE);

------------------------------------------------------------
-- 1. AMC MASTER
------------------------------------------------------------
INSERT INTO core.amc (amc_code, amc_name)
SELECT DISTINCT
    amc_code,
    amc_name
FROM src.amc
WHERE amc_code IS NOT NULL
  AND amc_name IS NOT NULL;

------------------------------------------------------------
-- 2. MF SCHEME MASTER
------------------------------------------------------------
INSERT INTO core.mf_schemes (
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
    s.scheme_code,
    s.scheme_name,
    s.scheme_type,
    s.scheme_category,
    s.plan,
    s.option,
    s.amc_code,
    s.launch_date
FROM src.schemes s
WHERE s.scheme_code IS NOT NULL;

------------------------------------------------------------
-- 3. Sanity checks (visible in DuckDB logs)
------------------------------------------------------------
SELECT 'amc_loaded' AS table, COUNT(*) FROM core.amc;
SELECT 'schemes_loaded' AS table, COUNT(*) FROM core.mf_schemes;

-- Cleanup
DETACH src;
