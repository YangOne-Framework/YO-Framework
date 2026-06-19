CREATE OR ALTER FUNCTION [dbo].[UDF_GetEndOfYear]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay] (DATEADD(YEAR, DATEDIFF(YEAR, -1, @ReferenceDate), -1))
    ;

	RETURN @Result;

END
