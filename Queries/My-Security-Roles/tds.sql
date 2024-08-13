SELECT DISTINCT role.NAME AS "My Role"
FROM   systemuser
       JOIN systemuserroles
         ON ( systemuser.systemuserid = systemuserroles.systemuserid )
       JOIN role
         ON ( systemuserroles.roleid = role.roleid )
WHERE  ( systemuser.systemuserid = dbo.Fn_finduserguid() )
ORDER  BY role.NAME ASC 