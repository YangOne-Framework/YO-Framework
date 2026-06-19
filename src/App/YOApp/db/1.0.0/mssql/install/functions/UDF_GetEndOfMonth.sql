CREATE OR ALTER FUNCTION [dbo].[UDF_GetEndOfMonth]
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
        [dbo].[UDF_GetEndOfDay] (DATEADD(MONTH, DATEDIFF(MONTH, -1, @ReferenceDate), -1))
    ;

	RETURN @Result;

END
