-- ================================
-- DuckDB canonical schema
-- ================================

CREATE SCHEMA IF NOT EXISTS mf;

-- ================================
-- AMC master
-- ================================
CREATE TABLE IF NOT EXISTS mf.amc (
  amc_code INTEGER PRIMARY KEY,
  amc_name TEXT NOT NULL
);

-- ================================
-- Mutual Fund Schemes
-- ================================
CREATE TABLE IF NOT EXISTS mf.mf_schemes (
  scheme_code INTEGER PRIMARY KEY,
  scheme_name TEXT NOT NULL,
  scheme_type TEXT,
  category TEXT,
  plan TEXT,
  option TEXT,
  amc_code INTEGER REFERENCES mf.amc(amc_code),
  launch_date DATE
);

-- ================================
-- NAV history
-- ================================
CREATE TABLE IF NOT EXISTS mf.mf_nav_history (
  scheme_code INTEGER REFERENCES mf.mf_schemes(scheme_code),
  nav_date DATE NOT NULL,
  nav DOUBLE,
  PRIMARY KEY (scheme_code, nav_date)
);

-- ================================
-- Indexes (for performance)
-- ================================
CREATE INDEX IF NOT EXISTS idx_nav_date
  ON mf.mf_nav_history(nav_date);

CREATE INDEX IF NOT EXISTS idx_nav_scheme
  ON mf.mf_nav_history(scheme_code);
