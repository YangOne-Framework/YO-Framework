-- ============================================================
-- Stored Procedure: usp_YOTheme_AddAsset
-- Description: Register an extracted theme asset
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_AddAsset') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_AddAsset
GO

CREATE PROCEDURE dbo.usp_YOTheme_AddAsset
    @YOThemeId      BIGINT,
    @AssetPath      NVARCHAR(500),
    @AssetType      NVARCHAR(50),
    @FileSize       BIGINT,
    @FileHash       NVARCHAR(128) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.YOThemeAsset (YOThemeId, AssetPath, AssetType, FileSize, FileHash)
    VALUES (@YOThemeId, @AssetPath, @AssetType, @FileSize, @FileHash);

    SELECT SCOPE_IDENTITY() AS YOThemeAssetId;
END
GO
