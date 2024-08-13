SELECT DISTINCT team.NAME      AS "Team Name",
                systemuser.systemuserid AS "User Id",
                systemuser.fullname     AS "Full Name"
FROM   team
       JOIN teamroles
         ON ( team.teamid = teamroles.teamid )
       JOIN role
         ON ( teamroles.roleid = role.roleid
              AND ( role.NAME = 'System Administrator' ) )
       JOIN teammembership
         ON ( team.teamid = teammembership.teamid )
       JOIN systemuser
         ON ( teammembership.systemuserid = systemuser.systemuserid )
ORDER  BY team.NAME ASC,
          systemuser.fullname ASC 