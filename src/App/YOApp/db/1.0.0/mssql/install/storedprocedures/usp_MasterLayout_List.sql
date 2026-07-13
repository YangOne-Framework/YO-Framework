-- ============================================================
-- Stored Procedure: usp_MasterLayout_List
-- Description: List master layouts from dbo.MasterLayout
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_MasterLayout_List') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_MasterLayout_List
GO

CREATE PROCEDURE dbo.usp_MasterLayout_List
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        LayoutId,
        LayoutGUID,
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
GO
