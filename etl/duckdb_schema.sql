-- Raw AMFI master (from funds.db)
CREATE TABLE amfi_master_raw (
  scheme_code INTEGER,
  isin_payout TEXT,
  isin_reinvest TEXT,
  scheme_name TEXT,
  amc_code INTEGER,
  amc_name TEXT,
  scheme_type TEXT,
  scheme_category TEXT,
  plan TEXT,
  option TEXT,
  launch_date DATE,
  closure_date DATE
);

-- Raw NAV history
CREATE TABLE nav_raw (
  scheme_code INTEGER,
  nav_date DATE,
  nav NUMERIC
);
