-- ============================================================
-- Stored Procedure: usp_CmsPage_Save
-- Description: Insert or update a CMS page in dbo.Page (upsert by PageGUID)
--              ContentConfig is only set on INSERT (initial creation).
--              Subsequent saves go to ContentConfigDraft.
--              Use usp_CmsPage_Publish to promote draft to published.
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_CmsPage_Save') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_CmsPage_Save
GO

CREATE PROCEDURE dbo.usp_CmsPage_Save
    @PageGUID           NVARCHAR(128),
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

    SELECT @ExistingId = PageId
    FROM dbo.Page
    WHERE PageGUID = @PageGUID AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.Page (
            PageGUID, Name, Slug, Url,
            [Status], PageType, MasterLayoutId,
            ContentConfig, ContentConfigDraft,
            [Version], PublishedAt, LastModified,
            UseMasterLayout, IsPublished, Culture,
            IsActive, AddedBy, UpdatedBy
        ) VALUES (
            @PageGUID, @Name, @Slug, @Url,
            @Status, @PageType, @MasterLayoutId,
            @ContentConfig, @ContentConfigDraft,
            @Version, @PublishedAt, GETDATE(),
            CASE WHEN @MasterLayoutId IS NOT NULL AND @MasterLayoutId != 'none' THEN 1 ELSE 0 END,
            CASE WHEN @Status = 'published' THEN 1 ELSE 0 END,
            @Culture, 1, @UpdatedBy, @UpdatedBy
        );

        SELECT SCOPE_IDENTITY() AS PageId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.Page
        SET
            Name              = @Name,
            Slug              = @Slug,
            Url               = @Url,
            [Status]          = @Status,
            PageType          = @PageType,
            MasterLayoutId    = @MasterLayoutId,
            ContentConfigDraft = COALESCE(@ContentConfigDraft, ContentConfigDraft),
            [Version]         = @Version,
            PublishedAt       = @PublishedAt,
            LastModified      = GETDATE(),
            UseMasterLayout   = CASE WHEN @MasterLayoutId IS NOT NULL AND @MasterLayoutId != 'none' THEN 1 ELSE 0 END,
            IsPublished       = CASE WHEN @Status = 'published' THEN 1 ELSE 0 END,
            UpdatedOn         = GETDATE(),
            UpdatedBy         = @UpdatedBy
        WHERE PageId = @ExistingId;

        SELECT @ExistingId AS PageId, 'updated' AS Action;
    END
END
GO
