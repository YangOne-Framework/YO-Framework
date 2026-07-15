-- ============================================================
-- Stored Procedure: usp_YOTheme_GetActive
-- Description: Get the currently active theme with overrides merged
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_GetActive') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_GetActive
GO

CREATE PROCEDURE dbo.usp_YOTheme_GetActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 1
        t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
        t.[Version], t.Author, t.Description, t.Tags,
        t.Screenshot, t.Config, t.IsActive, t.IsSystem,
        t.ParentYOThemeId, t.PackagePath, t.PackageHash,
        t.AddedOn, t.UpdatedOn,
        CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName
    FROM dbo.YOTheme t
    WHERE t.IsActive = 1 AND t.IsDeleted = 0;
END
GO
