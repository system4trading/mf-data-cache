-- ===============================
-- DuckDB Core Schema (Authoritative)
-- ===============================

CREATE SCHEMA IF NOT EXISTS core;

------------------------------------------------------------
-- CORE TABLES (single source of truth)
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER,
    launch_date DATE
);

CREATE TABLE IF NOT EXISTS mf_nav_history (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC,
    PRIMARY KEY (scheme_code, nav_date)
);

------------------------------------------------------------
-- STAGING
------------------------------------------------------------

CREATE TABLE IF NOT EXISTS nav_raw (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC
);

------------------------------------------------------------
-- 🔒 COMPATIBILITY VIEWS (THIS SOLVES EVERYTHING)
------------------------------------------------------------

CREATE OR REPLACE VIEW amc AS
SELECT * FROM amc;

CREATE OR REPLACE VIEW mf_schemes AS
SELECT * FROM mf_schemes;

CREATE OR REPLACE VIEW mf_nav_history AS
SELECT * FROM mf_nav_history;
