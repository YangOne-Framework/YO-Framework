-- ============================================================
-- Upgrade Script: 002-masterlayout-table.sql
-- Description: Creates dbo.MasterLayout table for CMS Studio
-- ============================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.MasterLayout') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.MasterLayout (
        LayoutId        BIGINT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        LayoutGUID      NVARCHAR(128) NOT NULL,
        Name            NVARCHAR(256) NOT NULL,
        Description     NVARCHAR(max) NULL,
        HasHeader       BIT NOT NULL DEFAULT 1,
        HasFooter       BIT NOT NULL DEFAULT 1,
        Sidebar         NVARCHAR(20) NOT NULL DEFAULT 'none',
        IsSystem        BIT NOT NULL DEFAULT 0,
        LayoutConfig    NVARCHAR(max) NULL,

        IsActive        BIT NOT NULL DEFAULT 1,
        IsDeleted       BIT NOT NULL DEFAULT 0,
        AddedOn         DATETIME NOT NULL DEFAULT GETDATE(),
        AddedBy         BIGINT NOT NULL DEFAULT 0,
        DeletedBy       BIGINT NOT NULL DEFAULT 0,
        DeletedOn       DATETIME NULL,
        UpdatedOn       DATETIME NULL,
        UpdatedBy       BIGINT NOT NULL DEFAULT 0
    );
END
GO

-- Seed system layouts
IF NOT EXISTS (SELECT * FROM dbo.MasterLayout WHERE IsSystem = 1)
BEGIN
    INSERT INTO dbo.MasterLayout (LayoutGUID, Name, Description, HasHeader, HasFooter, Sidebar, IsSystem, LayoutConfig)
    VALUES
        ('none',             'Standalone / No Master',   'Only page content is rendered.',                                                                0, 0, 'none', 1, NULL),
        ('default-site',     'Default Website',          'Editable header and footer around page content.',                                                 1, 1, 'none', 1, NULL),
        ('landing',          'Landing Page',             'Minimal campaign layout with compact nav.',                                                        1, 1, 'none', 1, NULL),
        ('docs-left-sidebar','Docs Left Sidebar',        'Header, footer, and editable left sidebar shell.',                                                 1, 1, 'left', 1, NULL);
END
GO

-- Indexes
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MasterLayout_LayoutGUID')
    CREATE INDEX IX_MasterLayout_LayoutGUID ON dbo.MasterLayout(LayoutGUID);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_MasterLayout_IsSystem')
    CREATE INDEX IX_MasterLayout_IsSystem ON dbo.MasterLayout(IsSystem, IsActive, IsDeleted);
GO
