-- ============================================================
-- Upgrade 005: Comprehensive rename GUID→UniqueId + recreate SPs
-- Handles: YOTheme, Page, MasterLayout columns + all SPs
-- ============================================================

-- ── 1. YOTheme ──────────────────────────────────────────────

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.YOTheme') AND name = 'YOThemeGUID')
BEGIN
    DROP INDEX IF EXISTS IX_YOTheme_YOThemeGUID ON dbo.YOTheme;
    EXEC sp_rename 'dbo.YOTheme.YOThemeGUID', 'YOThemeUniqueId', 'COLUMN';
END
GO

-- ── 2. Page ─────────────────────────────────────────────────

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Page') AND name = 'PageGUID')
BEGIN
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.Page') AND name = 'IX_Page_PageGUID')
        DROP INDEX IX_Page_PageGUID ON dbo.Page;
    EXEC sp_rename 'dbo.Page.PageGUID', 'PageUniqueId', 'COLUMN';
END
GO

-- ── 3. MasterLayout ─────────────────────────────────────────

IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.MasterLayout') AND name = 'LayoutGUID')
BEGIN
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.MasterLayout') AND name = 'IX_MasterLayout_LayoutGUID')
        DROP INDEX IX_MasterLayout_LayoutGUID ON dbo.MasterLayout;
    EXEC sp_rename 'dbo.MasterLayout.LayoutGUID', 'MasterLayoutUniqueId', 'COLUMN';
END
GO

-- ============================================================
-- YOTheme stored procedures
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_Save
    @YOThemeUniqueId    NVARCHAR(128),
    @Name               NVARCHAR(200),
    @Slug               NVARCHAR(200),
    @Version            NVARCHAR(20),
    @Author             NVARCHAR(200) = NULL,
    @Description        NVARCHAR(1000) = NULL,
    @Tags               NVARCHAR(500) = NULL,
    @Screenshot         NVARCHAR(500) = NULL,
    @Config             NVARCHAR(MAX) = NULL,
    @IsSystem           BIT = 0,
    @ParentYOThemeId    BIGINT = NULL,
    @PackagePath        NVARCHAR(1024) = NULL,
    @PackageHash        NVARCHAR(128) = NULL,
    @UpdatedBy          BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = YOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.YOTheme (
            YOThemeUniqueId, Name, Slug, [Version],
            Author, Description, Tags, Screenshot, Config,
            IsSystem, ParentYOThemeId, PackagePath, PackageHash,
            AddedBy, UpdatedBy
        ) VALUES (
            @YOThemeUniqueId, @Name, @Slug, @Version,
            @Author, @Description, @Tags, @Screenshot, @Config,
            @IsSystem, @ParentYOThemeId, @PackagePath, @PackageHash,
            @UpdatedBy, @UpdatedBy
        );

        SELECT SCOPE_IDENTITY() AS YOThemeId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.YOTheme
        SET
            Name            = @Name,
            Slug            = @Slug,
            [Version]       = @Version,
            Author          = @Author,
            Description     = @Description,
            Tags            = @Tags,
            Screenshot      = @Screenshot,
            Config          = @Config,
            IsSystem        = @IsSystem,
            ParentYOThemeId = @ParentYOThemeId,
            PackagePath     = @PackagePath,
            PackageHash     = @PackageHash,
            UpdatedOn       = GETDATE(),
            UpdatedBy       = @UpdatedBy
        WHERE YOThemeId = @ExistingId;

        SELECT @ExistingId AS YOThemeId, 'updated' AS Action;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_Get
    @YOThemeUniqueId    NVARCHAR(128) = NULL,
    @YOThemeId          BIGINT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug, t.[Version], t.Author, t.Config, t.Description, t.IsActive, t.AddedOn, t.UpdatedOn
    FROM dbo.YOTheme t
    WHERE t.IsDeleted = 0 AND t.IsActive = 1
      AND (@YOThemeId IS NULL OR t.YOThemeId = @YOThemeId)
      AND (@YOThemeUniqueId IS NULL OR t.YOThemeUniqueId = @YOThemeUniqueId);
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_List
    @Offset     INT = 1,
    @Limit      INT = 20,
    @Search     NVARCHAR(200) = '',
    @Status     NVARCHAR(20) = 'all'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @RowStart INT = (@Offset - 1) * @Limit + 1;
    DECLARE @RowEnd INT = @Offset * @Limit;
    ;WITH ThemeCTE AS (
        SELECT t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug, t.[Version], t.Author, t.Description, t.Tags, t.Screenshot, t.Config, t.IsActive, t.IsSystem, t.ParentYOThemeId, t.PackagePath, t.PackageHash, t.AddedOn, t.UpdatedOn,
            CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName,
            ROW_NUMBER() OVER (ORDER BY t.IsActive DESC, t.AddedOn DESC) AS RowNum,
            COUNT(*) OVER () AS RowTotal
        FROM dbo.YOTheme t
        WHERE t.IsDeleted = 0
          AND (@Search = '' OR t.Name LIKE '%' + @Search + '%' OR t.Slug LIKE '%' + @Search + '%')
          AND (@Status = 'all' OR (@Status = 'active' AND t.IsActive = 1) OR (@Status = 'inactive' AND t.IsActive = 0) OR (@Status = 'system' AND t.IsSystem = 1) OR (@Status = 'child' AND t.ParentYOThemeId IS NOT NULL))
    )
    SELECT * FROM ThemeCTE WHERE RowNum BETWEEN @RowStart AND @RowEnd ORDER BY RowNum;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_Delete
    @YOThemeUniqueId    NVARCHAR(128),
    @CascadeLayouts     BIT = 0,
    @DeletedBy          BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ExistingId BIGINT;
    SELECT @ExistingId = YOThemeId FROM dbo.YOTheme WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;
    IF @ExistingId IS NULL BEGIN SELECT 'not_found' AS Action; RETURN; END
    UPDATE dbo.YOTheme SET IsActive = 0, IsDeleted = 1, DeletedOn = GETDATE(), DeletedBy = @DeletedBy, UpdatedOn = GETDATE(), UpdatedBy = @DeletedBy WHERE YOThemeId = @ExistingId;
    SELECT 'deleted' AS Action;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_Activate
    @YOThemeUniqueId    NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TargetId BIGINT;
    SELECT @TargetId = YOThemeId FROM dbo.YOTheme WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;
    IF @TargetId IS NULL BEGIN SELECT 'not_found' AS Action; RETURN; END
    UPDATE dbo.YOTheme SET IsActive = 0 WHERE IsDeleted = 0;
    UPDATE dbo.YOTheme SET IsActive = 1 WHERE YOThemeId = @TargetId;
    SELECT 'activated' AS Action;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_GetActive
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP 1 t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug, t.[Version], t.Author, t.Config, t.Description, t.IsActive, t.AddedOn, t.UpdatedOn
    FROM dbo.YOTheme t WHERE t.IsDeleted = 0 AND t.IsActive = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_SaveOverride
    @YOThemeId      BIGINT,
    @KeyPath        NVARCHAR(500),
    @Value          NVARCHAR(MAX),
    @AddedBy        BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ExistingId BIGINT;
    SELECT @ExistingId = YOThemeOverrideId FROM dbo.YOThemeOverride WHERE YOThemeId = @YOThemeId AND KeyPath = @KeyPath;
    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.YOThemeOverride (YOThemeId, KeyPath, Value, AddedBy) VALUES (@YOThemeId, @KeyPath, @Value, @AddedBy);
        SELECT SCOPE_IDENTITY() AS YOThemeOverrideId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.YOThemeOverride SET Value = @Value WHERE YOThemeOverrideId = @ExistingId;
        SELECT @ExistingId AS YOThemeOverrideId, 'updated' AS Action;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_GetOverrides
    @YOThemeId  BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT YOThemeOverrideId, YOThemeId, KeyPath, Value, AddedOn, AddedBy FROM dbo.YOThemeOverride WHERE YOThemeId = @YOThemeId ORDER BY KeyPath;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOTheme_ClearOverrides
    @YOThemeId  BIGINT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.YOThemeOverride WHERE YOThemeId = @YOThemeId;
    SELECT @@ROWCOUNT AS DeletedCount;
END
GO

-- ============================================================
-- YOPage stored procedures
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_GetByPageId
    @PageUniqueId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.PageId, p.PageUniqueId, p.Name, p.Url, p.Slug, p.[Status], p.PageType, p.MasterLayoutId, p.ContentConfig, p.ContentConfigDraft, p.Content, p.IsPublished, p.UseMasterLayout, p.[Version], p.PublishedAt, p.LastModified, p.Culture, p.IsActive, p.AddedOn, p.AddedBy, p.UpdatedOn, p.UpdatedBy
    FROM dbo.Page p WHERE p.PageUniqueId = @PageUniqueId AND p.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_GetBySlug
    @Slug       NVARCHAR(512),
    @Status     NVARCHAR(20) = 'published'
AS
BEGIN
    SET NOCOUNT ON;
    SELECT p.PageId, p.PageUniqueId, p.Name, p.Url, p.Slug, p.[Status], p.PageType, p.MasterLayoutId, p.ContentConfig, p.ContentConfigDraft, p.Content, p.IsPublished, p.UseMasterLayout, p.[Version], p.PublishedAt, p.LastModified, p.Culture
    FROM dbo.Page p
    WHERE (p.Slug = @Slug OR p.Url = '/' + @Slug) AND p.PageType = 'cms' AND p.[Status] = @Status AND p.IsActive = 1 AND p.IsDeleted = 0;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_GetAllActive
    @Offset         INT = 1,
    @Limit          INT = 20,
    @Status         NVARCHAR(20) = 'all',
    @Search         NVARCHAR(256) = '',
    @Culture        NVARCHAR(10) = ''
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Skip INT = (@Offset - 1) * @Limit;
    ;WITH Filtered AS (
        SELECT p.PageId, p.PageUniqueId, p.Name, p.Url, p.Slug, p.[Status], p.PageType, p.MasterLayoutId, p.ContentConfig, p.ContentConfigDraft, p.IsPublished, p.UseMasterLayout, p.IsBackend, p.[Version], p.PublishedAt, p.LastModified, p.Culture, p.IsActive, p.AddedOn, p.AddedBy, p.UpdatedOn, p.UpdatedBy, COUNT(*) OVER() AS RowTotal
        FROM dbo.Page p
        WHERE p.IsDeleted = 0 AND p.IsActive = 1 AND p.PageType = 'cms'
          AND (@Culture = '' OR p.Culture = @Culture)
          AND (@Status = 'all' OR p.[Status] = @Status)
          AND (@Search = '' OR p.Name LIKE '%' + @Search + '%' OR p.Slug LIKE '%' + @Search + '%')
    )
    SELECT * FROM Filtered ORDER BY LastModified DESC OFFSET @Skip ROWS FETCH NEXT @Limit ROWS ONLY;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_Save
    @PageUniqueId           NVARCHAR(128),
    @Name               NVARCHAR(256),
    @Slug               NVARCHAR(512),
    @Url                NVARCHAR(256),
    @Status             NVARCHAR(20) = 'draft',
    @PageType           NVARCHAR(20) = 'cms',
    @MasterLayoutId     NVARCHAR(128) = NULL,
    @ContentConfig      NVARCHAR(max) = NULL,
    @ContentConfigDraft NVARCHAR(max) = NULL,
    @Version            INT = 1,
    @PublishedAt        DATETIME = NULL,
    @Culture            NVARCHAR(10) = 'en-US',
    @UpdatedBy          BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ExistingId BIGINT;
    SELECT @ExistingId = PageId FROM dbo.Page WHERE PageUniqueId = @PageUniqueId AND IsDeleted = 0;
    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.Page (PageUniqueId, Name, Slug, Url, [Status], PageType, MasterLayoutId, ContentConfig, ContentConfigDraft, [Version], PublishedAt, LastModified, UseMasterLayout, IsPublished, Culture, IsActive, AddedBy, UpdatedBy)
        VALUES (@PageUniqueId, @Name, @Slug, @Url, @Status, @PageType, @MasterLayoutId, @ContentConfig, @ContentConfigDraft, @Version, @PublishedAt, GETDATE(),
            CASE WHEN @MasterLayoutId IS NOT NULL AND @MasterLayoutId != 'none' THEN 1 ELSE 0 END,
            CASE WHEN @Status = 'published' THEN 1 ELSE 0 END, @Culture, 1, @UpdatedBy, @UpdatedBy);
        SELECT SCOPE_IDENTITY() AS PageId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.Page SET Name = @Name, Slug = @Slug, Url = @Url, [Status] = @Status, PageType = @PageType, MasterLayoutId = @MasterLayoutId, ContentConfigDraft = COALESCE(@ContentConfigDraft, ContentConfigDraft), [Version] = @Version, PublishedAt = @PublishedAt, LastModified = GETDATE(),
            UseMasterLayout = CASE WHEN @MasterLayoutId IS NOT NULL AND @MasterLayoutId != 'none' THEN 1 ELSE 0 END,
            IsPublished = CASE WHEN @Status = 'published' THEN 1 ELSE 0 END, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
        WHERE PageId = @ExistingId;
        SELECT @ExistingId AS PageId, 'updated' AS Action;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_Publish
    @PageUniqueId   NVARCHAR(128),
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Page SET ContentConfig = COALESCE(ContentConfigDraft, ContentConfig), [Status] = 'published', IsPublished = 1, [Version] = [Version] + 1, PublishedAt = GETDATE(), LastModified = GETDATE(), UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE PageUniqueId = @PageUniqueId AND IsDeleted = 0;
    IF @@ROWCOUNT = 0 BEGIN SELECT NULL AS PageId, 'not_found' AS Action; RETURN; END
    SELECT PageId, 'published' AS Action FROM dbo.Page WHERE PageUniqueId = @PageUniqueId;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_YOPage_Delete
    @PageUniqueId   NVARCHAR(128),
    @DeletedBy  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Page SET IsActive = 0, IsDeleted = 1, DeletedOn = GETDATE(), DeletedBy = @DeletedBy, UpdatedOn = GETDATE(), UpdatedBy = @DeletedBy
    WHERE PageUniqueId = @PageUniqueId AND IsDeleted = 0;
    IF @@ROWCOUNT = 0 BEGIN SELECT 'not_found' AS Action; RETURN; END
    SELECT 'deleted' AS Action;
END
GO

-- ============================================================
-- MasterLayout stored procedures
-- ============================================================

CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_GetAllActive
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MasterLayoutId, MasterLayoutUniqueId, Name, Description, HasHeader, HasFooter, Sidebar, IsSystem, LayoutConfig, IsActive, AddedOn, UpdatedOn
    FROM dbo.MasterLayout WHERE IsDeleted = 0 AND IsActive = 1 ORDER BY IsSystem DESC, Name ASC;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_GetById
    @MasterLayoutUniqueId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MasterLayoutID, MasterLayoutUniqueId, Name, Description, HasHeader, HasFooter, Sidebar, IsSystem, LayoutConfig, IsActive, AddedOn, UpdatedOn
    FROM dbo.MasterLayout WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsDeleted = 0 AND IsActive = 1;
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_Save
    @MasterLayoutUniqueId     NVARCHAR(128),
    @Name                       NVARCHAR(256),
    @Description                NVARCHAR(max) = NULL,
    @HasHeader                  BIT = 1,
    @HasFooter                  BIT = 1,
    @Sidebar                    NVARCHAR(20) = 'none',
    @IsSystem                   BIT = 0,
    @LayoutConfig               NVARCHAR(max) = NULL,
    @UpdatedBy                  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ExistingId BIGINT;
    SELECT @ExistingId = MasterLayoutID FROM dbo.MasterLayout WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsDeleted = 0;
    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.MasterLayout (MasterLayoutUniqueId, Name, Description, HasHeader, HasFooter, Sidebar, IsSystem, LayoutConfig, AddedBy, UpdatedBy)
        VALUES (@MasterLayoutUniqueId, @Name, @Description, @HasHeader, @HasFooter, @Sidebar, @IsSystem, @LayoutConfig, @UpdatedBy, @UpdatedBy);
        SELECT SCOPE_IDENTITY() AS LayoutId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.MasterLayout SET Name = @Name, Description = @Description, HasHeader = @HasHeader, HasFooter = @HasFooter, Sidebar = @Sidebar, LayoutConfig = @LayoutConfig, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
        WHERE MasterLayoutID = @ExistingId;
        SELECT @ExistingId AS MasterLayoutID, 'updated' AS Action;
    END
END
GO

CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_Delete
    @MasterLayoutUniqueId NVARCHAR(128),
    @DeletedBy  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (SELECT * FROM dbo.MasterLayout WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsSystem = 1 AND IsDeleted = 0)
    BEGIN SELECT 'cannot_delete_system' AS Action; RETURN; END
    UPDATE dbo.MasterLayout SET IsActive = 0, IsDeleted = 1, DeletedOn = GETDATE(), DeletedBy = @DeletedBy, UpdatedOn = GETDATE(), UpdatedBy = @DeletedBy
    WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsDeleted = 0;
    IF @@ROWCOUNT = 0 BEGIN SELECT 'not_found' AS Action; RETURN; END
    SELECT 'deleted' AS Action;
END
GO

PRINT 'Upgrade 005 complete.';
