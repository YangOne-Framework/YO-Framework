-- ============================================================
-- Stored Procedure: usp_YOTheme_List
-- Description: List themes with pagination and search
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_List') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_List
GO

CREATE PROCEDURE dbo.usp_YOTheme_List
    @Offset     INT = 1,
    @Limit      INT = 20,
    @Search     NVARCHAR(200) = '',
    @Status     NVARCHAR(20) = 'all'
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowStart INT, @RowEnd INT;
    SET @RowStart = (@Offset - 1) * @Limit + 1;
    SET @RowEnd = @Offset * @Limit;

    ;WITH ThemeCTE AS (
        SELECT
            t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
            t.[Version], t.Author, t.Description, t.Tags,
            t.Screenshot, t.Config, t.IsActive, t.IsSystem,
            t.ParentYOThemeId,
            t.PackagePath, t.PackageHash,
            t.AddedOn, t.UpdatedOn,
            CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName,
            ROW_NUMBER() OVER (ORDER BY t.IsActive DESC, t.AddedOn DESC) AS RowNum,
            COUNT(*) OVER () AS RowTotal
        FROM dbo.YOTheme t
        WHERE t.IsDeleted = 0
          AND (@Search = '' OR t.Name LIKE '%' + @Search + '%' OR t.Slug LIKE '%' + @Search + '%')
          AND (@Status = 'all'
               OR (@Status = 'active' AND t.IsActive = 1)
               OR (@Status = 'inactive' AND t.IsActive = 0)
               OR (@Status = 'system' AND t.IsSystem = 1)
               OR (@Status = 'child' AND t.ParentYOThemeId IS NOT NULL))
    )
    SELECT *
    FROM ThemeCTE
    WHERE RowNum BETWEEN @RowStart AND @RowEnd
    ORDER BY RowNum;
END
GO
