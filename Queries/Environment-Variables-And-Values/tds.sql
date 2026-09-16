SELECT 
    d.schemaname,
    d.displayname,
    d.type,
    d.defaultvalue,
    v.value AS currentvalue,
    d.description
FROM environmentvariabledefinition d
LEFT JOIN environmentvariablevalue v 
    ON d.environmentvariabledefinitionid = v.environmentvariabledefinitionid
ORDER BY d.schemaname;
