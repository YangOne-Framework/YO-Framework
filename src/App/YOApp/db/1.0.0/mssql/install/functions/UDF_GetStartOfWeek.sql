CREATE OR ALTER FUNCTION [dbo].[UDF_GetStartOfWeek]
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
        --DATEADD(WEEK, DATEDIFF(WEEK, @FirstOfWeekday, @ReferenceDate), @FirstOfWeekday)
        DATEADD(WEEK, DATEDIFF(DAY, @FirstOfWeekday, @ReferenceDate) / 7, @FirstOfWeekday)
    ;

	RETURN @Result;

END
