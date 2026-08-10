/* ============================================================================
   YOTheme Studio — Canonical Stored Procedures (single source of truth)
   Provider: SQL Server

   Consolidates the theme stored procedures formerly spread across:
     - 1.0.0/.../storedprocedures/usp_YOTheme_*
     - 1.1.0/.../002_theme_studio.sql

   Contains every procedure the runtime still calls:
     usp_YOTheme_Save / _Get / _List / _GetActive / _Activate / _Delete
     usp_YOThemeStudio_SaveConfig / _SetStatus / _Publish / _Resolve
     usp_YOThemeAssignment_Save / _Delete
     usp_YOThemeAudit_Log

   This file is idempotent (safe to re-run) and MUST be applied together
   with themestudio.schema.sql.
   ========================================================================== */


-- ============================================================
-- Stored Procedure: usp_YOTheme_Save
-- Description: Insert or update a theme (upsert by YOThemeUniqueId).
--              1.1.0: carries studio meta (Thumbnail, BrandKitId, SchemaVersion).
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Save') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Save
GO

CREATE PROCEDURE dbo.usp_YOTheme_Save
    @YOThemeUniqueId    NVARCHAR(128),
    @Name           NVARCHAR(200),
    @Slug           NVARCHAR(200),
    @Version        NVARCHAR(20),
    @Author         NVARCHAR(200) = NULL,
    @Description    NVARCHAR(1000) = NULL,
    @Tags           NVARCHAR(500) = NULL,
    @Screenshot     NVARCHAR(500) = NULL,
    @Config         NVARCHAR(MAX) = NULL,
    @IsSystem       BIT = 0,
    @ParentYOThemeId BIGINT = NULL,
    @PackagePath    NVARCHAR(1024) = NULL,
    @PackageHash    NVARCHAR(128) = NULL,
    @Thumbnail      NVARCHAR(500) = NULL,
    @BrandKitId     BIGINT = NULL,
    @SchemaVersion  INT = 2,
    @UpdatedBy      BIGINT = 0
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
            Thumbnail, BrandKitId, SchemaVersion, Status,
            ConfigHash, AddedBy, UpdatedBy
        ) VALUES (
            @YOThemeUniqueId, @Name, @Slug, @Version,
            @Author, @Description, @Tags, @Screenshot, @Config,
            @IsSystem, @ParentYOThemeId, @PackagePath, @PackageHash,
            @Thumbnail, @BrandKitId, @SchemaVersion, 'draft',
            CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', ISNULL(@Config, N'')), 2),
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
            ConfigHash      = CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', ISNULL(@Config, N'')), 2),
            IsSystem        = @IsSystem,
            ParentYOThemeId = @ParentYOThemeId,
            PackagePath     = @PackagePath,
            PackageHash     = @PackageHash,
            Thumbnail       = @Thumbnail,
            BrandKitId      = @BrandKitId,
            SchemaVersion   = @SchemaVersion,
            UpdatedOn       = GETDATE(),
            UpdatedBy       = @UpdatedBy
        WHERE YOThemeId = @ExistingId;

        SELECT @ExistingId AS YOThemeId, 'updated' AS Action;
    END
END
GO

-- ============================================================
-- Stored Procedure: usp_YOTheme_Get
-- Description: Get single theme by YOThemeUniqueId or YOThemeId.
--              1.1.0: returns studio lifecycle columns.
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
        t.Thumbnail, t.BrandKitId, t.PublishedConfig, t.CompiledCss, t.PublishedCss,
        t.ConfigHash, t.PublishedConfigHash, t.Status, t.IsDefault, t.IsPublished,
        t.PublishedOn, t.PublishedBy, t.SchemaVersion,
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

-- ============================================================
-- Stored Procedure: usp_YOTheme_List
-- Description: List themes with pagination, search and lifecycle filters.
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
            t.Thumbnail, t.BrandKitId, t.Status, t.IsDefault, t.IsPublished,
            t.PublishedOn, t.SchemaVersion,
            t.AddedOn, t.UpdatedOn,
            CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName,
            ROW_NUMBER() OVER (ORDER BY t.IsActive DESC, t.IsDefault DESC, t.AddedOn DESC) AS RowNum,
            COUNT(*) OVER () AS RowTotal
        FROM dbo.YOTheme t
        WHERE t.IsDeleted = 0
          AND (@Search = '' OR t.Name LIKE '%' + @Search + '%' OR t.Slug LIKE '%' + @Search + '%')
          AND (@Status = 'all'
               OR (@Status = 'active' AND t.IsActive = 1)
               OR (@Status = 'inactive' AND t.IsActive = 0)
               OR (@Status = 'system' AND t.IsSystem = 1)
               OR (@Status = 'child' AND t.ParentYOThemeId IS NOT NULL)
               OR (@Status = 'default' AND t.IsDefault = 1)
               OR (@Status = t.Status))
    )
    SELECT *
    FROM ThemeCTE
    WHERE RowNum BETWEEN @RowStart AND @RowEnd
    ORDER BY RowNum;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOTheme_GetActive
-- Description: Get the currently active theme with overrides merged.
--              (Legacy runtime contract — used by public renderers and
--              the studio active-theme endpoint.)
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
        t.Thumbnail, t.BrandKitId, t.PublishedConfig, t.CompiledCss, t.PublishedCss,
        t.Status, t.IsDefault, t.IsPublished, t.SchemaVersion,
        t.AddedOn, t.UpdatedOn,
        CASE WHEN t.ParentYOThemeId IS NOT NULL THEN (SELECT Name FROM dbo.YOTheme WHERE YOThemeId = t.ParentYOThemeId) ELSE NULL END AS ParentThemeName
    FROM dbo.YOTheme t
    WHERE t.IsActive = 1 AND t.IsDeleted = 0;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOTheme_Activate
-- Description: Set a single theme as active, deactivate others.
--              (Used by the theme-scheduler worker + legacy activation.)
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

    UPDATE dbo.YOTheme
    SET IsActive = 0, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE IsActive = 1 AND IsDeleted = 0;

    UPDATE dbo.YOTheme
    SET IsActive = 1, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE YOThemeId = @ThemeId;

    SELECT @ThemeId AS YOThemeId, 'activated' AS Action;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOTheme_Delete
-- Description: Soft-delete a theme and optionally cascade layouts.
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

    DELETE FROM dbo.YOThemeAsset WHERE YOThemeId = @ThemeId;
    DELETE FROM dbo.YOThemeOverride WHERE YOThemeId = @ThemeId;

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

    UPDATE dbo.Page
    SET YOThemeId = NULL, UpdatedOn = GETDATE()
    WHERE YOThemeId = @ThemeId;

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

-- ============================================================
-- Stored Procedure: usp_YOThemeStudio_SaveConfig
-- Description: Persist a working-draft configuration. Editing a
--              published/reviewed theme returns it to 'draft' while
--              the published snapshot stays live (blueprint §8).
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeStudio_SaveConfig') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeStudio_SaveConfig
GO

CREATE PROCEDURE dbo.usp_YOThemeStudio_SaveConfig
    @YOThemeUniqueId    NVARCHAR(128),
    @Config             NVARCHAR(MAX),
    @SchemaVersion      INT = 2,
    @UpdatedBy          BIGINT = 0,
    @IPAddress          NVARCHAR(64) = NULL,
    @PreserveStatus     BIT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId INT, @Status NVARCHAR(32);

    SELECT @ThemeId = YOThemeId, @Status = Status
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action, NULL AS Status;
        RETURN;
    END

    IF @PreserveStatus = 0 AND @Status IN ('published', 'under_review', 'approved')
        SET @Status = 'draft';

    UPDATE dbo.YOTheme
    SET Config        = @Config,
        ConfigHash    = CONVERT(NVARCHAR(128), HASHBYTES('SHA2_256', ISNULL(@Config, N'')), 2),
        SchemaVersion = @SchemaVersion,
        Status        = @Status,
        UpdatedOn     = GETDATE(),
        UpdatedBy     = @UpdatedBy
    WHERE YOThemeId = @ThemeId;

    INSERT INTO dbo.YOThemeAuditLog (YOThemeId, Action, Section, PropertyPath, NewValue, PerformedBy, IPAddress)
    VALUES (@ThemeId, 'theme.edited', 'config', NULL, LEFT(ISNULL(@Config, N''), 4000), @UpdatedBy, @IPAddress);

    SELECT @ThemeId AS YOThemeId, 'saved' AS Action, @Status AS Status;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeStudio_SetStatus
-- Description: Lifecycle transitions (blueprint §8).
--              Publishing is only allowed through usp_YOThemeStudio_Publish.
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeStudio_SetStatus') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeStudio_SetStatus
GO

CREATE PROCEDURE dbo.usp_YOThemeStudio_SetStatus
    @YOThemeUniqueId    NVARCHAR(128),
    @Status             NVARCHAR(32),          -- draft | under_review | approved | archived
    @UpdatedBy          BIGINT = 0,
    @IPAddress          NVARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId INT, @Current NVARCHAR(32), @IsDefault BIT, @IsActiveTheme BIT;

    SELECT @ThemeId = YOThemeId, @Current = Status, @IsDefault = IsDefault, @IsActiveTheme = IsActive
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action, NULL AS Status;
        RETURN;
    END

    IF @Status = 'published'
    BEGIN
        SELECT @ThemeId AS YOThemeId, 'use_publish' AS Action, @Current AS Status;
        RETURN;
    END

    IF @Status NOT IN ('draft', 'under_review', 'approved', 'archived')
    BEGIN
        SELECT @ThemeId AS YOThemeId, 'invalid_status' AS Action, @Current AS Status;
        RETURN;
    END

    IF @Status = 'archived'
    BEGIN
        IF @IsDefault = 1 OR @IsActiveTheme = 1
        BEGIN
            SELECT @ThemeId AS YOThemeId, 'cannot_archive' AS Action, @Current AS Status;
            RETURN;
        END
        IF EXISTS (SELECT 1 FROM dbo.YOThemeAssignment a WHERE a.YOThemeId = @ThemeId AND a.IsActive = 1)
        BEGIN
            SELECT @ThemeId AS YOThemeId, 'cannot_archive_assigned' AS Action, @Current AS Status;
            RETURN;
        END
    END

    IF NOT (
        (@Current = 'draft'        AND @Status IN ('under_review', 'archived')) OR
        (@Current = 'under_review' AND @Status IN ('approved', 'draft', 'archived')) OR
        (@Current = 'approved'     AND @Status IN ('draft', 'under_review', 'archived')) OR
        (@Current = 'published'    AND @Status IN ('draft', 'archived')) OR
        (@Current = 'archived'     AND @Status = 'draft') OR
        (@Current = @Status)
    )
    BEGIN
        SELECT @ThemeId AS YOThemeId, 'invalid_transition' AS Action, @Current AS Status;
        RETURN;
    END

    UPDATE dbo.YOTheme
    SET Status = @Status, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE YOThemeId = @ThemeId;

    INSERT INTO dbo.YOThemeAuditLog (YOThemeId, Action, Section, OldValue, NewValue, PerformedBy, IPAddress)
    VALUES (@ThemeId,
            CASE WHEN @Status = 'archived' THEN 'theme.archived'
                 WHEN @Status = 'under_review' THEN 'review.submitted'
                 ELSE 'theme.status_changed' END,
            'lifecycle', @Current, @Status, @UpdatedBy, @IPAddress);

    SELECT @ThemeId AS YOThemeId, 'status_updated' AS Action, @Status AS Status;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeStudio_Publish
-- Description: Publish the working draft — the published snapshot is
--              replaced atomically (blueprint §8). Compiled CSS produced
--              by the caller (studio compiler) is stored alongside.
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeStudio_Publish') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeStudio_Publish
GO

CREATE PROCEDURE dbo.usp_YOThemeStudio_Publish
    @YOThemeUniqueId    NVARCHAR(128),
    @CompiledCss        NVARCHAR(MAX) = NULL,
    @PublishedBy        BIGINT = 0,
    @IPAddress          NVARCHAR(64) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId INT, @Status NVARCHAR(32), @ParentId INT, @ParentPublished BIT;

    SELECT @ThemeId = YOThemeId, @Status = Status, @ParentId = ParentYOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action, NULL AS Status;
        RETURN;
    END

    IF @Status = 'archived'
    BEGIN
        SELECT @ThemeId AS YOThemeId, 'archived' AS Action, @Status AS Status;
        RETURN;
    END

    IF @ParentId IS NOT NULL
    BEGIN
        SELECT @ParentPublished = IsPublished FROM dbo.YOTheme WHERE YOThemeId = @ParentId AND IsDeleted = 0;
        IF @ParentPublished IS NULL OR @ParentPublished = 0
        BEGIN
            SELECT @ThemeId AS YOThemeId, 'missing_parent' AS Action, @Status AS Status;
            RETURN;
        END
    END

    /* Mark the published theme as the singleton active/default so every
       page route resolves to it (usp_YOThemeStudio_Resolve §legacy-active). */
    UPDATE dbo.YOTheme SET IsDefault = 0, IsActive = 0 WHERE IsDefault = 1 OR IsActive = 1;

    UPDATE dbo.YOTheme
    SET PublishedConfig     = Config,
        PublishedConfigHash = ConfigHash,
        CompiledCss         = ISNULL(@CompiledCss, CompiledCss),
        PublishedCss        = ISNULL(@CompiledCss, PublishedCss),
        IsPublished         = 1,
        IsDefault           = 1,
        IsActive            = 1,
        Status              = 'published',
        PublishedOn         = GETUTCDATE(),
        PublishedBy         = @PublishedBy,
        UpdatedOn           = GETDATE(),
        UpdatedBy           = @PublishedBy
    WHERE YOThemeId = @ThemeId;

    INSERT INTO dbo.YOThemeAuditLog (YOThemeId, Action, Section, PerformedBy, IPAddress)
    VALUES (@ThemeId, 'publication.completed', 'publishing', @PublishedBy, @IPAddress);

    SELECT @ThemeId AS YOThemeId, 'published' AS Action, 'published' AS Status;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeStudio_Resolve
-- Description: Resolve the effective theme for a runtime target
--              (blueprint §10 resolution priority):
--              campaign > feature > route/pagegroup > application/
--              website/portal > product > global > platform default
--              > legacy active theme.
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeStudio_Resolve') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeStudio_Resolve
GO

CREATE PROCEDURE dbo.usp_YOThemeStudio_Resolve
    @TargetType     NVARCHAR(64) = 'application',
    @TargetKey      NVARCHAR(512) = NULL,
    @Route          NVARCHAR(512) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Now DATETIME = GETUTCDATE();

    /* 1. Assignment match (published themes only, inside schedule window) */
    SELECT TOP 1
        t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
        t.[Version], t.Author, t.Description, t.Tags,
        t.Screenshot, t.Config, t.IsActive, t.IsSystem,
        t.ParentYOThemeId, t.PackagePath, t.PackageHash,
        t.Thumbnail, t.BrandKitId, t.PublishedConfig, t.CompiledCss, t.PublishedCss,
        t.ConfigHash, t.PublishedConfigHash, t.Status, t.IsDefault, t.IsPublished,
        t.PublishedOn, t.PublishedBy, t.SchemaVersion,
        t.IsDeleted, t.AddedOn, t.AddedBy, t.UpdatedOn, t.UpdatedBy,
        a.TargetType AS ResolvedTargetType,
        a.TargetKey AS ResolvedTargetKey,
        'assignment' AS ResolvedVia
    FROM dbo.YOThemeAssignment a
    INNER JOIN dbo.YOTheme t ON t.YOThemeId = a.YOThemeId
    WHERE a.IsActive = 1
      AND t.IsDeleted = 0 AND t.IsActive = 1
      AND t.IsPublished = 1 AND t.Status = 'published'
      AND (a.ActiveFrom IS NULL OR a.ActiveFrom <= @Now)
      AND (a.ActiveTo IS NULL OR a.ActiveTo >= @Now)
      AND (
            (a.TargetType = 'campaign' AND (@TargetKey = a.TargetKey OR (@Route IS NOT NULL AND @Route LIKE REPLACE(a.TargetKey, '*', '%'))))
         OR (a.TargetType = 'feature'  AND @TargetKey = a.TargetKey)
         OR (a.TargetType IN ('route', 'pagegroup') AND @Route IS NOT NULL AND (@Route = a.TargetKey OR @Route LIKE REPLACE(a.TargetKey, '*', '%')))
         OR (a.TargetType IN ('application', 'website', 'portal', 'product') AND @TargetKey = a.TargetKey)
         OR (a.TargetType = 'global')
      )
    ORDER BY
      CASE a.TargetType
          WHEN 'campaign' THEN 60 WHEN 'feature' THEN 50
          WHEN 'route' THEN 40 WHEN 'pagegroup' THEN 40
          WHEN 'application' THEN 30 WHEN 'website' THEN 30
          WHEN 'portal' THEN 30 WHEN 'product' THEN 20
          ELSE 10
      END + ISNULL(a.Priority, 0) DESC,
      a.ThemeAssignmentId DESC;

    IF @@ROWCOUNT > 0 RETURN;

    /* 2. Platform default published theme */
    SELECT TOP 1
        t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
        t.[Version], t.Author, t.Description, t.Tags,
        t.Screenshot, t.Config, t.IsActive, t.IsSystem,
        t.ParentYOThemeId, t.PackagePath, t.PackageHash,
        t.Thumbnail, t.BrandKitId, t.PublishedConfig, t.CompiledCss, t.PublishedCss,
        t.ConfigHash, t.PublishedConfigHash, t.Status, t.IsDefault, t.IsPublished,
        t.PublishedOn, t.PublishedBy, t.SchemaVersion,
        t.IsDeleted, t.AddedOn, t.AddedBy, t.UpdatedOn, t.UpdatedBy,
        'default' AS ResolvedTargetType,
        NULL AS ResolvedTargetKey,
        'default' AS ResolvedVia
    FROM dbo.YOTheme t
    WHERE t.IsDeleted = 0 AND t.IsActive = 1
      AND t.IsDefault = 1 AND t.IsPublished = 1 AND t.Status = 'published'
    ORDER BY t.PublishedOn DESC;

    IF @@ROWCOUNT > 0 RETURN;

    /* 3. Legacy active theme (pre-studio runtime contract) */
    SELECT TOP 1
        t.YOThemeId, t.YOThemeUniqueId, t.Name, t.Slug,
        t.[Version], t.Author, t.Description, t.Tags,
        t.Screenshot, t.Config, t.IsActive, t.IsSystem,
        t.ParentYOThemeId, t.PackagePath, t.PackageHash,
        t.Thumbnail, t.BrandKitId, t.PublishedConfig, t.CompiledCss, t.PublishedCss,
        t.ConfigHash, t.PublishedConfigHash, t.Status, t.IsDefault, t.IsPublished,
        t.PublishedOn, t.PublishedBy, t.SchemaVersion,
        t.IsDeleted, t.AddedOn, t.AddedBy, t.UpdatedOn, t.UpdatedBy,
        'legacy-active' AS ResolvedTargetType,
        NULL AS ResolvedTargetKey,
        'legacy' AS ResolvedVia
    FROM dbo.YOTheme t
    WHERE t.IsDeleted = 0 AND t.IsActive = 1
    ORDER BY t.UpdatedOn DESC;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeAssignment_Save
-- Description: Create or update a theme assignment (blueprint §10).
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeAssignment_Save') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeAssignment_Save
GO

CREATE PROCEDURE dbo.usp_YOThemeAssignment_Save
    @ThemeAssignmentId  BIGINT = 0,
    @YOThemeUniqueId    NVARCHAR(128),
    @TargetType         NVARCHAR(64),
    @TargetKey          NVARCHAR(512) = NULL,
    @Priority           INT = 0,
    @ActiveFrom         DATETIME = NULL,
    @ActiveTo           DATETIME = NULL,
    @IsDefault          BIT = 0,
    @IsActive           BIT = 1,
    @UpdatedBy          BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ThemeId INT;

    SELECT @ThemeId = YOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeUniqueId = @YOThemeUniqueId AND IsDeleted = 0;

    IF @ThemeId IS NULL
    BEGIN
        SELECT NULL AS ThemeAssignmentId, 'theme_not_found' AS Action;
        RETURN;
    END

    IF @IsDefault = 1
    BEGIN
        UPDATE dbo.YOThemeAssignment
        SET IsDefault = 0, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
        WHERE TargetType = @TargetType AND ISNULL(TargetKey, '') = ISNULL(@TargetKey, '') AND IsDefault = 1;
    END

    IF @ThemeAssignmentId > 0 AND EXISTS (SELECT 1 FROM dbo.YOThemeAssignment WHERE ThemeAssignmentId = @ThemeAssignmentId)
    BEGIN
        UPDATE dbo.YOThemeAssignment
        SET YOThemeId = @ThemeId,
            TargetType = @TargetType,
            TargetKey = @TargetKey,
            Priority = @Priority,
            ActiveFrom = @ActiveFrom,
            ActiveTo = @ActiveTo,
            IsDefault = @IsDefault,
            IsActive = @IsActive,
            UpdatedOn = GETDATE(),
            UpdatedBy = @UpdatedBy
        WHERE ThemeAssignmentId = @ThemeAssignmentId;

        SELECT @ThemeAssignmentId AS ThemeAssignmentId, 'updated' AS Action;
    END
    ELSE
    BEGIN
        INSERT INTO dbo.YOThemeAssignment (YOThemeId, TargetType, TargetKey, Priority, ActiveFrom, ActiveTo, IsDefault, IsActive, AddedBy, UpdatedBy)
        VALUES (@ThemeId, @TargetType, @TargetKey, @Priority, @ActiveFrom, @ActiveTo, @IsDefault, @IsActive, @UpdatedBy, @UpdatedBy);

        SELECT SCOPE_IDENTITY() AS ThemeAssignmentId, 'inserted' AS Action;
    END
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeAssignment_Delete
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeAssignment_Delete') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeAssignment_Delete
GO

CREATE PROCEDURE dbo.usp_YOThemeAssignment_Delete
    @ThemeAssignmentId  BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.YOThemeAssignment WHERE ThemeAssignmentId = @ThemeAssignmentId)
    BEGIN
        SELECT 'not_found' AS Action;
        RETURN;
    END

    DELETE FROM dbo.YOThemeAssignment WHERE ThemeAssignmentId = @ThemeAssignmentId;

    SELECT 'deleted' AS Action;
END
GO

-- ============================================================
-- Stored Procedure: usp_YOThemeAudit_Log
-- Description: Append an audit entry (blueprint §83).
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOThemeAudit_Log') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOThemeAudit_Log
GO

CREATE PROCEDURE dbo.usp_YOThemeAudit_Log
    @YOThemeId      INT = NULL,
    @Action         NVARCHAR(128),
    @Section        NVARCHAR(128) = NULL,
    @PropertyPath   NVARCHAR(512) = NULL,
    @OldValue       NVARCHAR(MAX) = NULL,
    @NewValue       NVARCHAR(MAX) = NULL,
    @PerformedBy    BIGINT = 0,
    @IPAddress      NVARCHAR(64) = NULL,
    @Remarks        NVARCHAR(2000) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO dbo.YOThemeAuditLog (YOThemeId, Action, Section, PropertyPath, OldValue, NewValue, PerformedBy, IPAddress, Remarks)
    VALUES (@YOThemeId, @Action, @Section, @PropertyPath, @OldValue, @NewValue, @PerformedBy, @IPAddress, @Remarks);

    SELECT SCOPE_IDENTITY() AS ThemeAuditLogId;
END
GO