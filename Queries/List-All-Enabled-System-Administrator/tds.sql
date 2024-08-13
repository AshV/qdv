SELECT DISTINCT systemuser.fullname,
                systemuser.internalemailaddress
FROM   systemuser
       JOIN systemuserroles
         ON ( systemuser.systemuserid = systemuserroles.systemuserid )
       JOIN role
         ON ( systemuserroles.roleid = role.roleid
              AND ( role.NAME = 'System Administrator' ) )
WHERE  ( systemuser.isdisabled = 0 )
ORDER  BY systemuser.fullname DESC 