-- ============================================================
-- Stored Procedure: usp_YOTheme_Delete
-- Description: Soft-delete a theme and optionally its layouts
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Delete') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Delete
GO

CREATE PROCEDURE dbo.usp_YOTheme_Delete
    @YOThemeUniqueId    NVARCHAR(128),
    @CascadeLayouts BIT = 0,
    @DeletedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId BIGINT;
    DECLARE @IsSystem BIT;

    SELECT @ThemeId = YOThemeId, @IsSystem = IsSystem
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action;
        RETURN;
    END

    IF @IsSystem = 1
    BEGIN
        SELECT @ThemeId AS YOThemeId, 'cannot_delete_system' AS Action;
        RETURN;
    END

    -- Delete theme assets
    DELETE FROM dbo.YOThemeAsset WHERE YOThemeId = @ThemeId;

    -- Delete overrides
    DELETE FROM dbo.YOThemeOverride WHERE YOThemeId = @ThemeId;

    -- Cascade to layouts
    IF @CascadeLayouts = 1
    BEGIN
        UPDATE dbo.MasterLayout
        SET IsDeleted = 1, DeletedBy = @DeletedBy, DeletedOn = GETDATE()
        WHERE YOThemeId = @ThemeId AND IsDeleted = 0;
    END
    ELSE
    BEGIN
        UPDATE dbo.MasterLayout
        SET YOThemeId = NULL, UpdatedOn = GETDATE(), UpdatedBy = @DeletedBy
        WHERE YOThemeId = @ThemeId;
    END

    -- Detach orphaned pages
    UPDATE dbo.Page
    SET YOThemeId = NULL, UpdatedOn = GETDATE()
    WHERE YOThemeId = @ThemeId;

    -- Soft-delete the theme
    UPDATE dbo.YOTheme
    SET
        IsDeleted = 1,
        IsActive = 0,
        DeletedBy = @DeletedBy,
        DeletedOn = GETDATE(),
        UpdatedOn = GETDATE(),
        UpdatedBy = @DeletedBy
    WHERE YOThemeId = @ThemeId;

    SELECT @ThemeId AS YOThemeId, 'deleted' AS Action;
END
GO
