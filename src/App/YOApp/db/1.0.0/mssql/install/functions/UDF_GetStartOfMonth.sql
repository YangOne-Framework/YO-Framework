CREATE OR ALTER FUNCTION [dbo].[UDF_GetStartOfMonth]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SET @ReferenceDate = CONVERT(DATE, @ReferenceDate);

    SELECT @Result =
        DATEADD(MONTH, DATEDIFF(MONTH, 0, @ReferenceDate), 0)
    ;

	RETURN @Result;

END
