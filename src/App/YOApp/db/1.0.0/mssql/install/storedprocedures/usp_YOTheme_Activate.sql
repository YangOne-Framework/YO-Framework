-- ============================================================
-- Stored Procedure: usp_YOTheme_Activate
-- Description: Set a single theme as active, deactivate others
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Activate') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Activate
GO

CREATE PROCEDURE dbo.usp_YOTheme_Activate
    @YOThemeUniqueId    NVARCHAR(128),
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId BIGINT;

    SELECT @ThemeId = YOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action;
        RETURN;
    END

    -- Deactivate all themes
    UPDATE dbo.YOTheme
    SET IsActive = 0, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE IsActive = 1 AND IsDeleted = 0;

    -- Activate target
    UPDATE dbo.YOTheme
    SET IsActive = 1, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE YOThemeId = @ThemeId;

    SELECT @ThemeId AS YOThemeId, 'activated' AS Action;
END
GO
