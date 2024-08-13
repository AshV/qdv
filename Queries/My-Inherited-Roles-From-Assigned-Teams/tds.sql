SELECT DISTINCT role.NAME AS "My Roles From Team"
FROM   systemuser
       JOIN teammembership
         ON ( systemuser.systemuserid = teammembership.systemuserid )
       JOIN team
         ON ( teammembership.teamid = team.teamid )
       JOIN teamroles
         ON ( team.teamid = teamroles.teamid )
       JOIN role
         ON ( teamroles.roleid = role.roleid )
WHERE  ( systemuser.systemuserid = dbo.Fn_finduserguid() )
ORDER  BY role.NAME ASC 