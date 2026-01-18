-- RAW
CREATE TABLE IF NOT EXISTS amfi_master_raw (
  scheme_code INTEGER,
  isin_payout TEXT,
  isin_reinvest TEXT,
  scheme_name TEXT,
  amc_name TEXT,
  scheme_type TEXT,
  scheme_category TEXT,
  plan TEXT,
  option TEXT,
  launch_date DATE
);

CREATE TABLE IF NOT EXISTS nav_raw (
  scheme_code INTEGER,
  nav_date DATE,
  nav NUMERIC
);

-- CANONICAL
CREATE TABLE IF NOT EXISTS mf.amc (
  amc_code INTEGER,
  amc_name TEXT
);

CREATE TABLE IF NOT EXISTS mf.mf_schemes (
  scheme_code INTEGER,
  scheme_name TEXT,
  scheme_type TEXT,
  category TEXT,
  plan TEXT,
  option TEXT,
  amc_code INTEGER,
  launch_date DATE
);

CREATE TABLE IF NOT EXISTS mf.mf_nav_history (
  scheme_code INTEGER,
  nav_date DATE,
  nav NUMERIC
);
