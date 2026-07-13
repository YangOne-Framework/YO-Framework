-- ============================================================
-- Stored Procedure: usp_CmsPage_GetBySlug
-- Description: Get a published CMS page by slug from dbo.Page
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_CmsPage_GetBySlug') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_CmsPage_GetBySlug
GO

CREATE PROCEDURE dbo.usp_CmsPage_GetBySlug
    @Slug       NVARCHAR(512),
    @Status     NVARCHAR(20) = 'published'
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        p.PageId,
        p.PageGUID,
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
GO
