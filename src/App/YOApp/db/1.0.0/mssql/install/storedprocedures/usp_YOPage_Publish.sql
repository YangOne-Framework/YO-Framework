CREATE OR ALTER PROCEDURE dbo.usp_CmsPage_Publish
    @PageUniqueId   NVARCHAR(128),
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Page
    SET
        ContentConfig = COALESCE(ContentConfigDraft, ContentConfig),
        [Status]      = 'published',
        IsPublished   = 1,
        [Version]     = [Version] + 1,
        PublishedAt   = GETDATE(),
        LastModified  = GETDATE(),
        UpdatedOn     = GETDATE(),
        UpdatedBy     = @UpdatedBy
    WHERE PageUniqueId = @PageUniqueId
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT NULL AS PageId, 'not_found' AS Action;
        RETURN;
    END

    SELECT PageId, 'published' AS Action
    FROM dbo.Page
    WHERE PageUniqueId = @PageUniqueId;
END
