CREATE OR ALTER PROCEDURE dbo.usp_YOPage_Delete
    @PageUniqueId   NVARCHAR(128),
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
    WHERE PageUniqueId = @PageUniqueId
      AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT 'not_found' AS Action;
        RETURN;
    END

    SELECT 'deleted' AS Action;
END
