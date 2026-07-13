-- ============================================================
-- Upgrade Script: 001-cmspage-page-table.sql
-- Description: Extends existing dbo.Page table with CMS Studio columns
-- ============================================================

-- Add columns for CMS Studio support
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'PageGUID')
    ALTER TABLE dbo.Page ADD PageGUID nvarchar(128) NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'PageType')
    ALTER TABLE dbo.Page ADD PageType nvarchar(20) NOT NULL DEFAULT 'legacy';
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'Status')
    ALTER TABLE dbo.Page ADD [Status] nvarchar(20) NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'Slug')
    ALTER TABLE dbo.Page ADD Slug nvarchar(512) NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'MasterLayoutId')
    ALTER TABLE dbo.Page ADD MasterLayoutId nvarchar(128) NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'Version')
    ALTER TABLE dbo.Page ADD [Version] int NOT NULL DEFAULT 1;
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'PublishedAt')
    ALTER TABLE dbo.Page ADD PublishedAt datetime NULL;
GO


IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'ContentConfigDraft')
    ALTER TABLE dbo.Page ADD [ContentConfigDraft] nvarchar(max) NULL;
GO
-- Indexes for CMS page lookups
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Page_PageGUID')
    CREATE INDEX IX_Page_PageGUID ON dbo.Page(PageGUID) WHERE PageGUID IS NOT NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Page_PageType')
    CREATE INDEX IX_Page_PageType ON dbo.Page(PageType, IsActive, IsDeleted);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Page_Slug')
    CREATE INDEX IX_Page_Slug ON dbo.Page(Slug) WHERE Slug IS NOT NULL;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Page_Status')
    CREATE INDEX IX_Page_Status ON dbo.Page([Status], IsActive, IsDeleted) WHERE [Status] IS NOT NULL;
GO
