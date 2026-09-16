SELECT 
    k.name AS keyname,
    e.name AS entitylogicalname,
    k.keyattributes,
    k.entitykeyindexstatus
FROM metadata.entitykey k
INNER JOIN metadata.entity e ON k.entityid = e.entityid
ORDER BY e.name, k.name;
