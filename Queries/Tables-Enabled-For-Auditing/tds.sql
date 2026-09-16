SELECT 
    name AS logicalname,
    originallocalizedname AS displayname,
    isauditenabled
FROM metadata.entity
WHERE isauditenabled = 1
ORDER BY name;
