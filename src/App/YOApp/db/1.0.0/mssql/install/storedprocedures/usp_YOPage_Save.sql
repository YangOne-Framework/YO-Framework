CREATE OR ALTER PROCEDURE dbo.usp_YOPage_Save
    @PageUniqueId           NVARCHAR(128),
    @Name                   NVARCHAR(256),
    @Slug                   NVARCHAR(512),
    @Url                    NVARCHAR(256),
    @Status                 NVARCHAR(20) = 'draft',
    @PageType               NVARCHAR(20) = 'cms',
    @MasterLayoutId         NVARCHAR(128) = NULL,
    @ContentConfig          NVARCHAR(max) = NULL,
    @ContentConfigDraft     NVARCHAR(max) = NULL,
    @Version                INT = 1,
    @PublishedAt            DATETIME = NULL,
    @Culture                NVARCHAR(10) = 'en-US',
    @TemplateType           NVARCHAR(100) = 'page',
    @UpdatedBy              BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = PageId
    FROM dbo.Page
    WHERE PageUniqueId = @PageUniqueId AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.Page (
            PageUniqueId, Name, Slug, Url,
            [Status], PageType, MasterLayoutId,
            ContentConfig, ContentConfigDraft,
            [Version], PublishedAt, LastModified,
            UseMasterLayout, IsPublished, Culture,
            TemplateType,
            IsActive, AddedBy, UpdatedBy
        ) VALUES (
            @PageUniqueId, @Name, @Slug, @Url,
            @Status, @PageType, @MasterLayoutId,
            @ContentConfig, @ContentConfigDraft,
            @Version, @PublishedAt, GETDATE(),
            CASE WHEN @MasterLayoutId IS NOT NULL AND @MasterLayoutId != 'none' THEN 1 ELSE 0 END,
            CASE WHEN @Status = 'published' THEN 1 ELSE 0 END,
            @Culture,
            @TemplateType,
            1, @UpdatedBy, @UpdatedBy
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
            TemplateType      = @TemplateType,
            UpdatedOn         = GETDATE(),
            UpdatedBy         = @UpdatedBy
        WHERE PageId = @ExistingId;

        SELECT @ExistingId AS PageId, 'updated' AS Action;
    END
END
