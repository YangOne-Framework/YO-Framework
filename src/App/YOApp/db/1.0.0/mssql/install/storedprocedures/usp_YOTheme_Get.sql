-- ============================================================
-- Stored Procedure: usp_YOTheme_Get
-- Description: Get single theme by YOThemeUniqueId or YOThemeId
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Get') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Get
GO

CREATE PROCEDURE dbo.usp_YOTheme_Get
    @YOThemeUniqueId    NVARCHAR(128) = NULL,
    @YOThemeId      BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
        t.[Version], t.Author, t.Description, t.Tags,
        t.Screenshot, t.Config, t.IsActive, t.IsSystem,
        t.ParentYOThemeId, t.PackagePath, t.PackageHash,
        t.IsDeleted, t.AddedOn, t.AddedBy,
        t.DeletedBy, t.DeletedOn, t.UpdatedOn, t.UpdatedBy,
        (SELECT COUNT(*) FROM dbo.YOThemeOverride o WHERE o.YOThemeId = t.YOThemeId) AS OverrideCount,
        CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName
    FROM dbo.YOTheme t
    WHERE t.IsDeleted = 0
      AND (@YOThemeUniqueId IS NULL OR t.YOThemeUniqueId = @YOThemeUniqueId)
      AND (@YOThemeId IS NULL OR t.YOThemeId = @YOThemeId);
END
GO
