CREATE OR ALTER FUNCTION [dbo].[UDF_GetStartOfQuarter]
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
        DATEADD(QUARTER, DATEDIFF(QUARTER, 0, @ReferenceDate), 0)
    ;

	RETURN @Result;

END
