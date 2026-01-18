DELETE FROM amfi_master_raw;

INSERT INTO amfi_master_raw
SELECT
  column0::INTEGER,
  column1,
  column2,
  column3,
  column4,
  column5,
  column6,
  column7,
  column8,
  STRPTIME(column9, '%d-%b-%Y')::DATE
FROM read_csv(
  'raw/amfi/MFMaster.txt',
  delim='|',
  header=false
)
WHERE column0 IS NOT NULL;
