-- =========================================================
-- DuckDB canonical schema
-- =========================================================

CREATE SCHEMA IF NOT EXISTS core;

-- ---------------------------------------------------------
-- AMC master
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

-- ---------------------------------------------------------
-- MF scheme master
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER REFERENCES core.amc(amc_code),
    launch_date DATE
);

-- ---------------------------------------------------------
-- NAV raw (staging)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS nav_raw (
    scheme_code INTEGER,
    nav_date DATE,
    nav NUMERIC
);

-- ---------------------------------------------------------
-- NAV history (canonical)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS core.mf_nav_history (
    scheme_code INTEGER REFERENCES core.mf_schemes(scheme_code),
    nav_date DATE,
    nav NUMERIC,
    PRIMARY KEY (scheme_code, nav_date)
);
