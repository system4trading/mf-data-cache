-- ---------------------------------------------------------
-- DuckDB canonical schema (NO SQLite here)
-- ---------------------------------------------------------

-- Always create schema explicitly
CREATE SCHEMA IF NOT EXISTS mf;

------------------------------------------------------------
-- AMC master
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mf.amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

------------------------------------------------------------
-- Mutual fund schemes
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mf.mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER,
    launch_date DATE
);

------------------------------------------------------------
-- NAV history
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mf.mf_nav_history (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC,
    PRIMARY KEY (scheme_code, nav_date)
);
