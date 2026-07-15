-- ============================================================
-- Stored Procedure: usp_YOTheme_SaveOverride
-- Description: Upsert a single theme override key
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_SaveOverride') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_SaveOverride
GO

CREATE PROCEDURE dbo.usp_YOTheme_SaveOverride
    @YOThemeId      BIGINT,
    @KeyPath        NVARCHAR(500),
    @Value          NVARCHAR(MAX),
    @AddedBy        BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = YOThemeOverrideId
    FROM dbo.YOThemeOverride
    WHERE YOThemeId = @YOThemeId AND KeyPath = @KeyPath;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.YOThemeOverride (YOThemeId, KeyPath, Value, AddedBy)
        VALUES (@YOThemeId, @KeyPath, @Value, @AddedBy);

        SELECT SCOPE_IDENTITY() AS YOThemeOverrideId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.YOThemeOverride
        SET Value = @Value
        WHERE YOThemeOverrideId = @ExistingId;

        SELECT @ExistingId AS YOThemeOverrideId, 'updated' AS Action;
    END
END
GO
