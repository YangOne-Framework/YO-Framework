CREATE OR ALTER FUNCTION [dbo].[UDF_ConvertLocalToLocalByTimezoneId]
(
    @OriginalTimezoneId INT
    ,@TargetTimezoneId INT
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (
        @TargetTimezoneId
        ,[dbo].[UDF_ConvertLocalToUtcByTimezoneId] (
            @OriginalTimezoneId
            ,@LocalDate
        )
    );

	RETURN @Result;

END
