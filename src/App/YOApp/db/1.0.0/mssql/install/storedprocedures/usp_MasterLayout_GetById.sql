CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_GetById
    @MasterLayoutUniqueId NVARCHAR(128)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MasterLayoutID,
        MasterLayoutUniqueId,
        Name,
        Description,
        HasHeader,
        HasFooter,
        Sidebar,
        IsSystem,
        LayoutConfig,
        IsActive,
        AddedOn,
        UpdatedOn
    FROM dbo.MasterLayout
    WHERE MasterLayoutUniqueId = @MasterLayoutUniqueId
      AND IsDeleted = 0
      AND IsActive = 1;
END

