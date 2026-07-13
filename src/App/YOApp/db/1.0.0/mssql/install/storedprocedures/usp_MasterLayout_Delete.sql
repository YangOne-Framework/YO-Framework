-- ============================================================
-- Stored Procedure: usp_MasterLayout_Delete
-- Description: Soft delete a master layout by LayoutGUID
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_MasterLayout_Delete') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_MasterLayout_Delete
GO

CREATE PROCEDURE dbo.usp_MasterLayout_Delete
    @LayoutGUID NVARCHAR(128),
    @DeletedBy  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Prevent deletion of system layouts
    IF EXISTS (SELECT * FROM dbo.MasterLayout WHERE LayoutGUID = @LayoutGUID AND IsSystem = 1 AND IsDeleted = 0)
    BEGIN
        SELECT 'cannot_delete_system' AS Action;
        RETURN;
    END

    UPDATE dbo.MasterLayout
    SET
        IsActive   = 0,
        IsDeleted  = 1,
        DeletedOn  = GETDATE(),
        DeletedBy  = @DeletedBy,
        UpdatedOn  = GETDATE(),
        UpdatedBy  = @DeletedBy
    WHERE LayoutGUID = @LayoutGUID
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT 'not_found' AS Action;
        RETURN;
    END

    SELECT 'deleted' AS Action;
END
GO
