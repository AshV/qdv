SELECT DISTINCT team.NAME
FROM   team
       JOIN teamroles
         ON ( team.teamid = teamroles.teamid )
       JOIN role
         ON ( teamroles.roleid = role.roleid
              AND ( role.NAME = 'System Administrator' ) )
WHERE  (( team.teamtype != 1
           OR team.teamtype IS NULL ))
ORDER  BY team.NAME ASC 