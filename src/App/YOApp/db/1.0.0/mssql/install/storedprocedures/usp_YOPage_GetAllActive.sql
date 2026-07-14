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
            p.IsPublished,
            p.UseMasterLayout,
            p.IsBackend,
            p.[Version],
            p.PublishedAt,
            p.LastModified,
            p.Culture,
            p.IsActive,
            p.AddedOn,
            p.AddedBy,
            p.UpdatedOn,
            p.UpdatedBy,
            COUNT(*) OVER() AS RowTotal
        FROM dbo.Page p
        WHERE p.IsDeleted = 0
          AND p.IsActive = 1
          AND p.PageType = 'cms'
          AND (@Culture = '' OR p.Culture = @Culture)
          AND (@Status = 'all' OR p.[Status] = @Status)
          AND (@Search = '' OR p.Name LIKE '%' + @Search + '%' OR p.Slug LIKE '%' + @Search + '%')
    )
    SELECT *
    FROM Filtered
    ORDER BY LastModified DESC
    OFFSET @Skip ROWS
    FETCH NEXT @Limit ROWS ONLY;
END
