-- Example: remove bad NAVs
DELETE FROM mf_nav_history WHERE nav <= 0;
