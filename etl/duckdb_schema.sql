-- ===============================
-- DuckDB Schema (FLAT, FINAL)
-- ===============================

-- AMC MASTER
CREATE TABLE analytics.amc (
    amc_code INTEGER PRIMARY KEY,
    amc_name TEXT NOT NULL
);

-- MF SCHEME MASTER
CREATE TABLE analytics.mf_schemes (
    scheme_code INTEGER PRIMARY KEY,
    scheme_name TEXT NOT NULL,
    scheme_type TEXT,
    category TEXT,
    plan TEXT,
    option TEXT,
    amc_code INTEGER,
    launch_date DATE
);

-- NAV RAW (staging)
CREATE TABLE analytics.nav_raw (
    scheme_code INTEGER,
    nav_date DATE,
    nav DOUBLE
);

-- FINAL NAV HISTORY
CREATE TABLE analytics.mf_nav_history (
    scheme_code INTEGER,
    nav_date DATE,
    nav DOUBLE,
    PRIMARY KEY (scheme_code, nav_date)
);
