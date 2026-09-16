SELECT 
    u.fullname,
    u.applicationid,
    u.domainname,
    u.isdisabled,
    r.name AS rolename
FROM systemuser u
INNER JOIN systemuserroles ur ON u.systemuserid = ur.systemuserid
INNER JOIN role r ON ur.roleid = r.roleid
WHERE u.applicationid IS NOT NULL
ORDER BY u.fullname, r.name;
