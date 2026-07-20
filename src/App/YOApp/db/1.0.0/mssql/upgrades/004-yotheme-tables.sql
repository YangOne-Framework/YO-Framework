-- ============================================================
-- Upgrade Script: 004-yotheme-tables.sql
-- Description: Adds YOTheme system tables for the Three-Tier
--              Theming Architecture (Token, Variant, Structure).
--              Adds ThemeId + TemplateType to MasterLayout & Page.
-- ============================================================

-- ============================================================
-- 1. YOTheme — Core theme table
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.YOTheme') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.YOTheme
    (
        YOThemeId               BIGINT IDENTITY(1,1) PRIMARY KEY,
        YOThemeUniqueId             NVARCHAR(128) NOT NULL,
        Name                    NVARCHAR(200) NOT NULL,
        Slug                    NVARCHAR(200) NOT NULL,
        [Version]               NVARCHAR(20) NOT NULL,
        Author                  NVARCHAR(200) NULL,
        Description             NVARCHAR(1000) NULL,
        Tags                    NVARCHAR(500) NULL,
        Screenshot              NVARCHAR(500) NULL,
        Config                  NVARCHAR(MAX) NULL,
        IsActive                BIT NOT NULL DEFAULT 0,
        IsSystem                BIT NOT NULL DEFAULT 0,
        ParentYOThemeId         BIGINT NULL,
        PackagePath             NVARCHAR(1024) NULL,
        PackageHash             NVARCHAR(128) NULL,
        IsDeleted               BIT NOT NULL DEFAULT 0,
        AddedOn                 DATETIME NOT NULL DEFAULT GETDATE(),
        AddedBy                 BIGINT NOT NULL DEFAULT 0,
        DeletedBy               BIGINT NOT NULL DEFAULT 0,
        DeletedOn               DATETIME NULL,
        UpdatedOn               DATETIME NULL,
        UpdatedBy               BIGINT NOT NULL DEFAULT 0
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YOTheme_Slug')
    CREATE INDEX IX_YOTheme_Slug ON dbo.YOTheme(Slug) WHERE IsDeleted = 0;
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YOTheme_IsActive')
    CREATE INDEX IX_YOTheme_IsActive ON dbo.YOTheme(IsActive) WHERE IsActive = 1 AND IsDeleted = 0;
GO

-- ============================================================
-- 2. YOThemeOverride — Customizer changes (diffs against Config)
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.YOThemeOverride') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.YOThemeOverride
    (
        YOThemeOverrideId       BIGINT IDENTITY(1,1) PRIMARY KEY,
        YOThemeId               BIGINT NOT NULL REFERENCES dbo.YOTheme(YOThemeId),
        KeyPath                 NVARCHAR(500) NOT NULL,
        Value                   NVARCHAR(MAX) NOT NULL,
        AddedOn                 DATETIME NOT NULL DEFAULT GETDATE(),
        AddedBy                 BIGINT NOT NULL DEFAULT 0
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YOThemeOverride_ThemeId')
    CREATE INDEX IX_YOThemeOverride_ThemeId ON dbo.YOThemeOverride(YOThemeId);
GO

-- ============================================================
-- 3. YOThemeAsset — Tracks files extracted from theme ZIP
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.YOThemeAsset') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.YOThemeAsset
    (
        YOThemeAssetId          BIGINT IDENTITY(1,1) PRIMARY KEY,
        YOThemeId               BIGINT NOT NULL REFERENCES dbo.YOTheme(YOThemeId),
        AssetPath               NVARCHAR(500) NOT NULL,
        AssetType               NVARCHAR(50) NOT NULL,
        FileSize                BIGINT NOT NULL,
        FileHash                NVARCHAR(128) NULL,
        AddedOn                 DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_YOThemeAsset_ThemeId')
    CREATE INDEX IX_YOThemeAsset_ThemeId ON dbo.YOThemeAsset(YOThemeId);
GO

-- ============================================================
-- 4. Add YOThemeId to MasterLayout
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.MasterLayout') AND name = 'YOThemeId')
    ALTER TABLE dbo.MasterLayout ADD YOThemeId BIGINT NULL REFERENCES dbo.YOTheme(YOThemeId);
GO

-- ============================================================
-- 5. Add YOThemeId + TemplateType to Page
-- ============================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'YOThemeId')
    ALTER TABLE dbo.Page ADD YOThemeId BIGINT NULL REFERENCES dbo.YOTheme(YOThemeId);
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'TemplateType')
    ALTER TABLE dbo.Page ADD TemplateType NVARCHAR(100) NOT NULL DEFAULT 'page';
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'ThemeOverrideJson')
    ALTER TABLE dbo.Page ADD ThemeOverrideJson NVARCHAR(MAX) NULL;
GO

-- ============================================================
-- 6. Insert system default theme
-- ============================================================
IF NOT EXISTS (SELECT * FROM dbo.YOTheme WHERE Slug = 'yo-default')
BEGIN
    INSERT INTO dbo.YOTheme (
        YOThemeUniqueId, Name, Slug, [Version], Author,
        Description, Tags, Config, IsActive, IsSystem, AddedBy
    ) VALUES (
        'SYSTEM-YO-DEFAULT-THEME',
        'YO Default',
        'yo-default',
        '1.0.0',
        'YangOne Framework',
        'System default theme with clean responsive layout.',
        'default,system',
        N'{
  "tokens": {
    "colors": {
      "primary":   { "default": "#2563eb", "dark": "#3b82f6" },
      "secondary": { "default": "#7c3aed", "dark": "#8b5cf6" },
      "accent":    { "default": "#f59e0b", "dark": "#fbbf24" },
      "bg":        { "default": "#ffffff", "dark": "#0f172a" },
      "text":      { "default": "#1e293b", "dark": "#e2e8f0" },
      "border":    { "default": "#e2e8f0", "dark": "#334155" },
      "muted":     { "default": "#f8fafc", "dark": "#1e293a" }
    },
    "fonts": {
      "heading": { "family": "Inter", "source": "google", "weights": [400,600,700] },
      "body":    { "family": "Inter", "source": "google", "weights": [400,500] }
    },
    "spacing": { "0": "0", "1": "0.25rem", "2": "0.5rem", "3": "0.75rem", "4": "1rem", "5": "1.25rem", "6": "1.5rem", "8": "2rem", "10": "2.5rem", "12": "3rem", "16": "4rem", "20": "5rem", "24": "6rem" },
    "border-radius": { "sm": "0.25rem", "md": "0.5rem", "lg": "1rem", "full": "9999px" },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  "components": {
    "button": {
      "variant": "primary",
      "paddingX": "1.25rem",
      "paddingY": "0.625rem",
      "borderRadius": "var(--radius-md, 0.5rem)",
      "shadow": "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
      "transition": "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      "variants": {
        "primary":  { "classes": "yo-btn yo-btn-primary" },
        "secondary":{ "classes": "yo-btn yo-btn-secondary" },
        "outline":  { "classes": "yo-btn yo-btn-outline" },
        "text":     { "classes": "yo-btn yo-btn-text" }
      }
    },
    "card": {
      "variant": "default",
      "padding": "1.5rem",
      "borderRadius": "var(--radius-lg, 0.75rem)",
      "shadow": "var(--shadow-md)",
      "variants": {
        "default":  { "classes": "yo-card" },
        "elevated": { "classes": "yo-card yo-card-hover" },
        "bordered": { "classes": "yo-card border-2" },
        "flat":     { "classes": "yo-card !shadow-none" }
      }
    },
    "badge": {
      "variant": "primary",
      "variants": {
        "primary":  { "classes": "yo-badge yo-badge-primary" },
        "secondary":{ "classes": "yo-badge yo-badge-secondary" },
        "accent":   { "classes": "yo-badge yo-badge-accent" },
        "success":  { "classes": "yo-badge yo-badge-success" },
        "danger":   { "classes": "yo-badge yo-badge-danger" }
      }
    },
    "input": {
      "variant": "default",
      "borderRadius": "var(--radius-md, 0.5rem)",
      "padding": "0.625rem 0.875rem",
      "variants": {
        "default":  { "classes": "yo-input" },
        "filled":   { "classes": "yo-input bg-[var(--yo-muted)]" },
        "underlined":{ "classes": "yo-input !border-0 !border-b-2 !rounded-none" }
      }
    },
    "alert": {
      "variant": "info",
      "variants": {
        "info":    { "classes": "yo-alert yo-alert-info" },
        "success": { "classes": "yo-alert yo-alert-success" },
        "warning": { "classes": "yo-alert yo-alert-warning" },
        "error":   { "classes": "yo-alert yo-alert-error" }
      }
    },
    "navbar": {
      "variant": "default",
      "variants": {
        "default": { "classes": "yo-navbar" },
        "dark":    { "classes": "yo-navbar !bg-[var(--yo-text)] !text-[var(--yo-bg)]" }
      }
    },
    "sidebar": {
      "variant": "default",
      "variants": {
        "default": { "classes": "yo-sidebar" },
        "clean":   { "classes": "yo-sidebar !border-0" }
      }
    },
    "table": {
      "variant": "default",
      "variants": {
        "default":  { "classes": "yo-table-container yo-table" },
        "striped":  { "classes": "yo-table-container yo-table [&_.yo-table-row:nth-child(even)]:bg-black/5" },
        "bordered": { "classes": "yo-table-container yo-table !border-2" }
      }
    },
    "footer": {
      "variant": "default",
      "variants": {
        "default":  { "classes": "yo-footer" },
        "minimal":  { "classes": "yo-footer !py-8" },
        "columns":  { "classes": "yo-footer grid grid-cols-1 sm:grid-cols-4 gap-6" }
      }
    }
  },
  "structure": {
    "layoutType": "sidebar-right",
    "layoutTypes": {
      "sidebar-right": { "shell": "SidebarRightShell" },
      "sidebar-left":  { "shell": "SidebarLeftShell" },
      "topnav":        { "shell": "TopNavShell" },
      "minimal":       { "shell": "MinimalShell" }
    }
  },
  "customizer": {
    "controls": {
      "colors": {
        "primary":   { "type": "color", "label": "Primary Color" },
        "secondary": { "type": "color", "label": "Secondary Color" },
        "bg":        { "type": "color", "label": "Background" },
        "text":      { "type": "color", "label": "Text Color" }
      },
      "fonts": {
        "heading": { "type": "font", "label": "Heading Font" },
        "body":    { "type": "font", "label": "Body Font" }
      },
      "components": {
        "button": {
          "type": "select", "label": "Button Style",
          "options": [
            { "value": "pill", "label": "Pill" },
            { "value": "sharp", "label": "Sharp" },
            { "value": "elevated", "label": "Elevated" }
          ]
        },
        "card": {
          "type": "select", "label": "Card Style",
          "options": [
            { "value": "shadow", "label": "Shadow" },
            { "value": "bordered", "label": "Bordered" },
            { "value": "flat", "label": "Flat" }
          ]
        }
      }
    }
  }
}',
        1, 1, 0
    );
END
GO
