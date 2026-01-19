-- Canonical DuckDB schema
CREATE SCHEMA IF NOT EXISTS core;

DROP TABLE IF EXISTS core.amc;
DROP TABLE IF EXISTS core.mf_schemes;
DROP TABLE IF EXISTS core.mf_nav_history;

CREATE TABLE core.amc (
  amc_code INTEGER PRIMARY KEY,
  amc_name TEXT NOT NULL
);

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

CREATE TABLE core.mf_nav_history (
  scheme_code INTEGER REFERENCES core.mf_schemes(scheme_code),
  nav_date DATE,
  nav NUMERIC,
  PRIMARY KEY (scheme_code, nav_date)
);
