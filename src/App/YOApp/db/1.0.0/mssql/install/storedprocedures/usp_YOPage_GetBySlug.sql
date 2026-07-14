CREATE OR ALTER PROCEDURE dbo.usp_YOPage_GetBySlug
    @Slug       NVARCHAR(512),
    @Status     NVARCHAR(20) = 'published'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.PageId,
        p.PageUniqueId,
        p.Name,
        p.Url,
        p.Slug,
        p.[Status],
        p.PageType,
        p.MasterLayoutId,
        p.ContentConfig,
        p.ContentConfigDraft,
        p.Content,
        p.IsPublished,
        p.UseMasterLayout,
        p.[Version],
        p.PublishedAt,
        p.LastModified,
        p.Culture
    FROM dbo.Page p
    WHERE (p.Slug = @Slug OR p.Url = '/' + @Slug)
      AND p.PageType = 'cms'
      AND p.[Status] = @Status
      AND p.IsActive = 1
      AND p.IsDeleted = 0;
END
