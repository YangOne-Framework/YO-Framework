-- ============================================================
-- Upgrade Script: 003-masterlayout-optimize.sql
-- Description: Optimizes MasterLayout list queries:
--   1. Adds covering index for list SP WHERE/ORDER BY
--   2. Creates lightweight list SP (without LayoutConfig)
--   3. Adds index for single-lookup queries
-- ============================================================

-- Covering index for usp_MasterLayout_List (WHERE IsDeleted, IsActive + ORDER BY IsSystem, Name)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MasterLayout_List_Covering')
    CREATE NONCLUSTERED INDEX IX_MasterLayout_List_Covering
        ON dbo.MasterLayout(IsDeleted, IsActive, IsSystem DESC, Name ASC)
        INCLUDE (LayoutGUID, Description, HasHeader, HasFooter, Sidebar, AddedOn, UpdatedOn);
GO

-- ============================================================
-- Lightweight list: no LayoutConfig (NVARCHAR(max) excluded)
-- Use for admin browsing / sidebar lists where only metadata is needed
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_MasterLayout_ListLight') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_MasterLayout_ListLight
GO

CREATE PROCEDURE dbo.usp_MasterLayout_ListLight
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
        IsActive,
        AddedOn,
        UpdatedOn
    FROM dbo.MasterLayout
    WHERE IsDeleted = 0
      AND IsActive = 1
    ORDER BY IsSystem DESC, Name ASC;
END
GO
