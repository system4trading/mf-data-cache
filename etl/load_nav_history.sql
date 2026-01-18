DELETE FROM nav_raw;

INSERT INTO nav_raw
SELECT
  column0::INTEGER                        AS scheme_code,
  STRPTIME(column7, '%d-%b-%Y')::DATE     AS nav_date,
  column8::NUMERIC                        AS nav
FROM read_csv(
  'raw/navall/NAVAll.txt',
  delim=';',
  header=false
)
WHERE column0 IS NOT NULL
  AND column8 IS NOT NULL;
