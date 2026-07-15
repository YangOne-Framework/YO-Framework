-- ============================================================
-- Stored Procedure: usp_YOTheme_GetOverrides
-- Description: Get all overrides for a theme as a flat list
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_GetOverrides') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_GetOverrides
GO

CREATE PROCEDURE dbo.usp_YOTheme_GetOverrides
    @YOThemeId      BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        YOThemeOverrideId, YOThemeId, KeyPath, Value, AddedOn, AddedBy
    FROM dbo.YOThemeOverride
    WHERE YOThemeId = @YOThemeId
    ORDER BY KeyPath;
END
GO
