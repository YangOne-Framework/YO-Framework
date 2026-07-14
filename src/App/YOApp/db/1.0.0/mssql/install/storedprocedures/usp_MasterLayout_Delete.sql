CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_Delete
    @MasterLayoutUniqueId NVARCHAR(128),
    @DeletedBy  BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Prevent deletion of system layouts
    IF EXISTS (SELECT * FROM dbo.MasterLayout WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId AND IsSystem = 1 AND IsDeleted = 0)
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
    WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT 'not_found' AS Action;
        RETURN;
    END

    SELECT 'deleted' AS Action;
END
