SELECT 
    u.fullname,
    u.domainname,
    u.internalemailaddress,
    u.createdon
FROM systemuser u
LEFT JOIN systemuserroles ur ON u.systemuserid = ur.systemuserid
WHERE u.isdisabled = 0
  AND u.accessmode <> 4
  AND ur.roleid IS NULL
ORDER BY u.fullname;
