SELECT 
    s.uniquename,
    s.friendlyname,
    s.version,
    s.ismanaged,
    s.installedon,
    p.friendlyname AS publishername,
    p.customizationprefix AS prefix,
    s.description
FROM solution s
INNER JOIN publisher p ON s.publisherid = p.publisherid
WHERE s.isvisible = 1
ORDER BY s.installedon DESC;
