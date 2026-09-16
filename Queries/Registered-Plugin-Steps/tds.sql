SELECT 
    s.name,
    f.primaryobjecttypecode AS primaryentity,
    m.name AS message,
    CASE s.stage 
        WHEN 10 THEN 'Pre-validation' 
        WHEN 20 THEN 'Pre-operation' 
        WHEN 40 THEN 'Post-operation' 
        ELSE CAST(s.stage AS VARCHAR) 
    END AS stage,
    CASE s.mode 
        WHEN 0 THEN 'Synchronous' 
        WHEN 1 THEN 'Asynchronous' 
        ELSE CAST(s.mode AS VARCHAR) 
    END AS mode,
    s.rank,
    s.statecode,
    s.filteringattributes
FROM sdkmessageprocessingstep s
INNER JOIN sdkmessagefilter f ON s.sdkmessagefilterid = f.sdkmessagefilterid
INNER JOIN sdkmessage m ON s.sdkmessageid = m.sdkmessageid
ORDER BY s.name;
