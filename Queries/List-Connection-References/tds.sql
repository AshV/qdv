SELECT 
    connectionreferencelogicalname,
    connectionreferencedisplayname,
    connectorid,
    statuscode,
    statecode
FROM connectionreference
ORDER BY connectionreferencedisplayname;
