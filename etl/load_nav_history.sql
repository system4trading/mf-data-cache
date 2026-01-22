-- ---------------------------------------------------------
-- Load historical NAV data (2006 → present)
-- Source: captn3m0/historical-mf-data + latest NAVAll
-- ---------------------------------------------------------

-- Clear existing NAV history
DELETE FROM mf_nav_history;

-- Load ALL historical NAV files
INSERT INTO mf_nav_history (
    scheme_code,
    nav_date,
    nav
)
SELECT
    CAST(column0 AS INTEGER)                AS scheme_code,
    STRPTIME(column7, '%d-%b-%Y')::DATE     AS nav_date,
    CAST(column4 AS DOUBLE)                 AS nav
FROM read_csv_auto(
    'raw/navall/*.txt',
    delim=';',
    header=FALSE,
    ignore_errors=TRUE
)
WHERE
    column0 IS NOT NULL
    AND column4 IS NOT NULL
    AND column7 IS NOT NULL;
