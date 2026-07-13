-- ============================================================
-- Stored Procedure: usp_CmsPage_Publish
-- Description: Publish a CMS page by copying ContentConfigDraft
--              into ContentConfig, incrementing version, and
--              setting status to published.
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_CmsPage_Publish') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_CmsPage_Publish
GO

CREATE PROCEDURE dbo.usp_CmsPage_Publish
    @PageGUID   NVARCHAR(128),
    @UpdatedBy  BIGINT = 0
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
    WHERE PageGUID = @PageGUID
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT NULL AS PageId, 'not_found' AS Action;
        RETURN;
    END

    SELECT PageId, 'published' AS Action
    FROM dbo.Page
    WHERE PageGUID = @PageGUID;
END
GO
