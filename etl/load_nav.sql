COPY nav_raw
FROM 'raw/navall/*.txt'
(DELIMITER ';', HEADER);

-- Normalize
DELETE FROM nav_raw WHERE nav IS NULL OR nav <= 0;

