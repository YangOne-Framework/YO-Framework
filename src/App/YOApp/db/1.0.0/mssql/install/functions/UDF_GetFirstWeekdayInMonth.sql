CREATE OR ALTER FUNCTION [dbo].[UDF_GetFirstWeekdayInMonth]
(
    @DayOfWeek INT
    ,@ReferenceDate DATETIME2
)
RETURNS DATE
AS
BEGIN
	DECLARE
        @Result DATE = NULL
    ;  

    SELECT @Result =
        DATEADD(
            DAY
            ,7
            ,[dbo].[UDF_GetLastWeekdayInMonth] (@DayOfWeek, DATEADD(MONTH, -1, @ReferenceDate))
        )
    ;

	RETURN @Result;

END
