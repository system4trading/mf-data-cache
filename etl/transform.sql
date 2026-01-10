-- Remove invalid NAVs
DELETE FROM mf_nav_history
WHERE nav IS NULL OR nav <= 0;

-- Remove invalid scheme codes
DELETE FROM mf_nav_history
WHERE scheme_code IS NULL;

-- Ensure only valid schemes remain
DELETE FROM mf_nav_history
WHERE scheme_code NOT IN (
  SELECT scheme_code FROM mf_schemes
);
