CREATE OR ALTER FUNCTION [dbo].[UDF_GetStartOfDay]
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
        CONVERT(DATETIME2, CONVERT(DATE, @ReferenceDate))
    ;

	RETURN @Result;

END
