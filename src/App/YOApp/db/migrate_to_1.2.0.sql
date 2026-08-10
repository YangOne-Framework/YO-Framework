/* ============================================================================
   YO Framework — Combined migration script
   Upgrades from 1.0.0 → 1.2.0
   Run this against your database (SSMS / sqlcmd)
   ============================================================================ */

/* Step 1: 1.0.0 → 1.1.0 — YOTheme Studio lifecycle + all studio tables */
:r "1.1.0/mssql/upgrade/1_0_0_to_1_1_0/002_theme_studio.sql"

/* Step 2: 1.1.0 → 1.2.0 — Phase 2-6 tables (edit locks, CVD, tokens graph, etc.) */
:r "1.2.0/mssql/upgrade/1_1_0_to_1_2_0/001_theme_studio_phase2_6.sql"

/* Step 3: Update config version */
IF NOT EXISTS (SELECT 1 FROM dbo.YOConfig WHERE ConfigKey = 'DbVersion')
    INSERT INTO dbo.YOConfig (ConfigKey, ConfigValue) VALUES ('DbVersion', '1.2.0');
ELSE
    UPDATE dbo.YOConfig SET ConfigValue = '1.2.0' WHERE ConfigKey = 'DbVersion';
GO
