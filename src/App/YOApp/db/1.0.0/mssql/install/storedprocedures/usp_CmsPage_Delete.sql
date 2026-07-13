-- ============================================================
-- Stored Procedure: usp_CmsPage_Delete
-- Description: Soft delete a CMS page from dbo.Page by PageGUID
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_CmsPage_Delete') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_CmsPage_Delete
GO

CREATE PROCEDURE dbo.usp_CmsPage_Delete
    @PageGUID   NVARCHAR(128),
    @DeletedBy  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE dbo.Page
    SET
        IsActive   = 0,
        IsDeleted  = 1,
        DeletedOn  = GETDATE(),
        DeletedBy  = @DeletedBy,
        UpdatedOn  = GETDATE(),
        UpdatedBy  = @DeletedBy
    WHERE PageGUID = @PageGUID
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT 'not_found' AS Action;
        RETURN;
    END

    SELECT 'deleted' AS Action;
END
GO
