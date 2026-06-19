CREATE OR ALTER FUNCTION [dbo].[UDF_GetEndOfWeek]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
        ,@DayOfWeek INT = @@DATEFIRST
    ;  

    DECLARE
        @FirstOfWeekday DATETIME2 = DATEADD(DAY, @DayOfWeek - 1, 0)
    ;

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay](DATEADD(DAY, 6, [dbo].[UDF_GetStartOfWeek](@ReferenceDate)))
    ;

	RETURN @Result;

END
