SELECT DISTINCT team.NAME AS "My Team"
FROM   systemuser
       JOIN teammembership
         ON ( systemuser.systemuserid = teammembership.systemuserid )
       JOIN team
         ON ( teammembership.teamid = team.teamid )
WHERE  ( systemuser.systemuserid = dbo.Fn_finduserguid() )
ORDER  BY team.NAME ASC 