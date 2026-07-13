-- ============================================================
-- Stored Procedure: usp_MasterLayout_Get
-- Description: Get a master layout by LayoutGUID
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_MasterLayout_Get') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_MasterLayout_Get
GO

CREATE PROCEDURE dbo.usp_MasterLayout_Get
    @LayoutGUID NVARCHAR(128)
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
    WHERE LayoutGUID = @LayoutGUID
      AND IsDeleted = 0
      AND IsActive = 1;
END
GO
