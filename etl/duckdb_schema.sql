-- ===============================
-- DuckDB Core Schema
-- ===============================

CREATE SCHEMA IF NOT EXISTS core;

-- -------------------------------
-- AMC MASTER
-- -------------------------------
CREATE TABLE IF NOT EXISTS core.amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

-- -------------------------------
-- MF SCHEME MASTER
-- -------------------------------
CREATE TABLE IF NOT EXISTS core.mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER,
    launch_date DATE,
    FOREIGN KEY (amc_code) REFERENCES core.amc(amc_code)
);

-- -------------------------------
-- RAW NAV (staging)
-- -------------------------------
CREATE TABLE IF NOT EXISTS nav_raw (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC
);

-- -------------------------------
-- FINAL NAV HISTORY
-- -------------------------------
CREATE TABLE IF NOT EXISTS core.mf_nav_history (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC,
    PRIMARY KEY (scheme_code, nav_date),
    FOREIGN KEY (scheme_code) REFERENCES core.mf_schemes(scheme_code)
);
