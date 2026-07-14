CREATE OR ALTER PROCEDURE dbo.usp_MasterLayout_GetAllActive
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        MasterLayoutId,
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
    WHERE IsDeleted = 0
      AND IsActive = 1
    ORDER BY IsSystem DESC, Name ASC;
END
