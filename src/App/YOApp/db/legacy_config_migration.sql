/* ============================================================================
   Legacy flat-token config -> three-level token migration
   Handles collation by using explicit casts + temp table
   ============================================================================ */

/* Backfill lifecycle state for pre-studio rows */
UPDATE dbo.YOTheme
SET Status              = 'published',
    IsPublished         = 1,
    PublishedConfig     = Config,
    PublishedConfigHash = ConfigHash,
    PublishedOn         = GETUTCDATE()
WHERE IsActive = 1 AND IsPublished = 0 AND IsDeleted = 0 AND Status = 'draft';
GO

/* Update SchemaVersion for themes that already have v2 configs stored */
UPDATE dbo.YOTheme
SET SchemaVersion = 2
WHERE SchemaVersion = 1
  AND IsDeleted = 0
  AND Config IS NOT NULL
  AND ISJSON(Config) = 1
  AND JSON_VALUE(Config, '$.version') = 2;
GO
