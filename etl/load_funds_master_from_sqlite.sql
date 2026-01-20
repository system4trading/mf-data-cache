SET schema 'core';

-- ---------------------------------------------------------
-- Load AMFI Scheme Master from captn3m0 funds.db (SQLite)
-- ---------------------------------------------------------

ATTACH 'funds.db' AS src (TYPE SQLITE);

------------------------------------------------------------
-- 1. AMC MASTER
------------------------------------------------------------
INSERT INTO amc (amc_code, amc_name)
SELECT DISTINCT
    amc_code,
    amc_name
FROM src.amc
WHERE amc_code IS NOT NULL
  AND amc_name IS NOT NULL;

------------------------------------------------------------
-- 2. MF SCHEME MASTER
------------------------------------------------------------
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

DETACH src;
