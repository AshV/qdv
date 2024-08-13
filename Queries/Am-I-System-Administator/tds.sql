SELECT DISTINCT role.NAME AS "YouAre"
FROM   systemuser
       JOIN systemuserroles
         ON ( systemuser.systemuserid = systemuserroles.systemuserid )
       JOIN role
         ON ( systemuserroles.roleid = role.roleid
              AND ( role.NAME = 'System Administrator' ) )
WHERE  ( systemuser.systemuserid = dbo.Fn_finduserguid() ) 
