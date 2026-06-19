CREATE OR ALTER FUNCTION [dbo].[UDF_GetLastWeekdayInMonth]
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

    -- support of .NET values
    IF @DayOfWeek = 0 BEGIN
        SET @DayOfWeek = 7;
    END;  

    DECLARE
        @FirstOfWeekday DATETIME2 = DATEADD(DAY, @DayOfWeek - 1, 0)
    ;  

    SELECT @Result =
        DATEADD(
            DAY
            ,DATEDIFF(
                DAY
                ,@FirstOfWeekday
                ,DATEADD(
                    MONTH
                    ,DATEDIFF(
                        MONTH
                        ,0
                        ,@ReferenceDate
                    )
                    ,DATEADD(
                        DAY
                        ,-1
                        ,DATEADD(
                            MONTH
                            ,1
                            ,0
                        )
                    )
                )
            ) / 7 * 7
            ,@FirstOfWeekday
        )
    ;

	RETURN @Result;

END
