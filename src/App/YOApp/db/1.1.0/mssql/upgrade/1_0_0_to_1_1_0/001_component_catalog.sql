/* ============================================================================
   YO Framework 1.1.0 — Component Catalog Category
   Route: 1_0_0_to_1_1_0
   Provider: SQL Server
   Idempotent: safe to re-run.
   ========================================================================== */

IF COL_LENGTH('dbo.HtmlComponent','CatalogCategory') IS NULL
BEGIN
    ALTER TABLE dbo.HtmlComponent ADD CatalogCategory nvarchar(128) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_HtmlComponent_Catalog' AND object_id = OBJECT_ID('dbo.HtmlComponent'))
BEGIN
    CREATE INDEX IX_HtmlComponent_Catalog
        ON dbo.HtmlComponent (IsDeleted, IsActive, CatalogCategory, Name);
END
GO
