CREATE OR ALTER PROCEDURE dbo.usp_YOPage_GetByPageId
    @PageUniqueId NVARCHAR(128)
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
        p.Culture,
        p.IsActive,
        p.AddedOn,
        p.AddedBy,
        p.UpdatedOn,
        p.UpdatedBy
    FROM dbo.Page p
    WHERE p.PageUniqueId = @PageUniqueId
      AND p.IsDeleted = 0;
END
