-- ============================================================
-- Stored Procedure: usp_CmsPage_GetByPageGUID
-- Description: Get a CMS page by its PageGUID (frontend UUID)
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_CmsPage_GetByPageGUID') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_CmsPage_GetByPageGUID
GO

CREATE PROCEDURE dbo.usp_CmsPage_GetByPageGUID
    @PageGUID NVARCHAR(128)
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
        p.Culture,
        p.IsActive,
        p.AddedOn,
        p.AddedBy,
        p.UpdatedOn,
        p.UpdatedBy
    FROM dbo.Page p
    WHERE p.PageGUID = @PageGUID
      AND p.IsDeleted = 0;
END
GO
