SELECT 
    name,
    operationtype,
    statuscode,
    message,
    startedon,
    completedon
FROM asyncoperation
WHERE statuscode = 31 -- Failed
  AND completedon >= DATEADD(day, -7, GETUTCDATE())
ORDER BY completedon DESC;
