CREATE OR ALTER FUNCTION [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier]
(
    @OriginalTimezoneIdentifier NVARCHAR(100)
    ,@TargetTimezoneIdentifier NVARCHAR(100)
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] (
        @TargetTimezoneIdentifier
        ,[dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] (
            @OriginalTimezoneIdentifier
            ,@LocalDate
        )
    );

	RETURN @Result;

END
