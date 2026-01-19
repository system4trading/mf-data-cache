-- ---------------------------------------------------------
-- DuckDB canonical schema (NO ambiguity)
-- ---------------------------------------------------------

-- Drop schema if re-running (safe in CI)
DROP SCHEMA IF EXISTS core CASCADE;

-- Create clean schema
CREATE SCHEMA core;

------------------------------------------------------------
-- AMC MASTER
------------------------------------------------------------
CREATE TABLE core.amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

------------------------------------------------------------
-- MF SCHEME MASTER
------------------------------------------------------------
CREATE TABLE core.mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER REFERENCES core.amc(amc_code),
    launch_date DATE
);

------------------------------------------------------------
-- NAV HISTORY
------------------------------------------------------------
CREATE TABLE core.mf_nav_history (
    scheme_code INTEGER REFERENCES core.mf_schemes(scheme_code),
    nav_date DATE,
    nav DOUBLE,
    PRIMARY KEY (scheme_code, nav_date)
);
