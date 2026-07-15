-- ============================================================
-- Stored Procedure: usp_YOTheme_ClearOverrides
-- Description: Remove all overrides for a theme (reset to default)
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_ClearOverrides') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_ClearOverrides
GO

CREATE PROCEDURE dbo.usp_YOTheme_ClearOverrides
    @YOThemeId      BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    DELETE FROM dbo.YOThemeOverride
    WHERE YOThemeId = @YOThemeId;

    SELECT @@ROWCOUNT AS DeletedCount;
END
GO
