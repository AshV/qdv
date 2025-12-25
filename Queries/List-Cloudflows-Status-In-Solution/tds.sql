SELECT "workflow0".workflowid AS "workflowid"
	,"workflow0".NAME AS "name"
	,"workflow0".categoryname AS "categoryname"
	,"workflow0".statecodename AS "statecodename"
	,"workflow0".statuscodename AS "statuscodename"
	,"sol" uniquename AS "sol.uniquename"
FROM Workflow AS "workflow0"
INNER JOIN Solution Component AS "sc" ON (
		"workflow0".WORK INNER JOIN Solution AS "sol" ON (
				"sc".solutionid = "sol".solutionid
				AND ("sol".uniguename = N'Default')
				)
		WHERE ("workflow0".category = 5)
		)
