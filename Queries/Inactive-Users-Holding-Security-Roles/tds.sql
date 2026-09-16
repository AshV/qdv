SELECT DISTINCT 
    u.fullname,
    u.domainname,
    r.name AS rolename,
    u.modifiedon
FROM systemuser u
INNER JOIN systemuserroles ur ON u.systemuserid = ur.systemuserid
INNER JOIN role r ON ur.roleid = r.roleid
WHERE u.isdisabled = 1
ORDER BY u.fullname, r.name;
