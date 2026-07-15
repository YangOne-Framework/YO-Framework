# YO-Framework Theme Architecture

> **YO** = YangOne Framework  
> Table prefix: `YOTheme` • SP prefix: `usp_YOTheme_*`

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Three-Tier Theming Model](#2-three-tier-theming-model)
3. [Database Schema](#3-database-schema)
4. [Stored Procedures](#4-stored-procedures)
5. [Theme Package Format (ZIP)](#5-theme-package-format-zip)
6. [Theme Manifest](#6-theme-manifest)
7. [Template Hierarchy](#7-template-hierarchy)
8. [Admin Flow](#8-admin-flow)
9. [Public Rendering Flow](#9-public-rendering-flow)
10. [Theme Customizer](#10-theme-customizer)
11. [Child Themes](#11-child-themes)
12. [Export & Import](#12-export--import)
13. [Cache Strategy](#13-cache-strategy)
14. [Developing a Theme (Dev Guide)](#14-developing-a-theme-dev-guide)
15. [Implementation Phases](#15-implementation-phases)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        THEME LAYERS                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  1. TOKEN LAYER  (CSS Custom Properties)                    │    │
│  │     Colors, fonts, spacing, border-radius, shadows           │    │
│  │     Injected as <style>:root { --primary: #... }             │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  2. VARIANT LAYER  (Component UI/UX via React Context)      │    │
│  │     buttonStyle: 'pill' | 'sharp' | 'elevated'               │    │
│  │     cardStyle:   'shadow' | 'bordered' | 'flat'              │    │
│  │     navbarStyle: 'default' | 'centered' | 'transparent'      │    │
│  │     Components use useTheme() → resolve Tailwind classes     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                │                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  3. STRUCTURE LAYER  (React Shell Components)                │    │
│  │     layoutType: 'sidebar-right' | 'topnav' | 'minimal'       │    │
│  │     Maps to React shell component: <SidebarRightShell> ...   │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Public Request Lifecycle

```
Browser → /about-us
  │
  ▼
DynamicPageLoader.tsx
  └─ useGetPublicPageBySlugQuery(slug)
       │
       ▼
Server: PublicPageController.GetBySlug
  ├─ PublicPageCache.TryGet(slug) ── HIT → Return cached
  │
  ├─ DB: Page WHERE Slug=@slug AND Status='published'
  │    └─ returns: ThemeId, LayoutId, TemplateType, sections, components
  │
  ├─ DB: YOTheme WHERE YOThemeId=Page.ThemeId
  │    └─ returns: theme.json content (tokens + components + structure)
  │
  ├─ DB: MasterLayout WHERE LayoutGUID=Page.MasterLayoutId
  │    └─ includes zone definitions from theme's layout file
  │
  ├─ Resolve Template:
  │    hierarchy: page-{slug} → {TemplateType} → default → layout fallback
  │
  ├─ Build response: themeConfig + template + layout + page content
  ├─ PublicPageCache.Set(slug, response) → TTL 4hrs
  │
  ▼
DynamicPage.tsx
  ├─ <ThemeProvider> ← reads themeConfig from response
  ├─ <Shell> resolves from theme.structure.layoutType → SidebarRightShell
  │    └─ zones mapped from resolved template
  ├─ <style>:root { --primary: #2563eb; ... } ← token CSS vars injected
  ├─ Google Fonts <link> injected if needed
  └─ <PageRenderer>
       ├─ Layout zones (header/footer from layout components)
       └─ Page sections with components
            └─ Each component: useTheme().resolveComponent('button')
               → returns Tailwind variant classes
```

---

## 2. Three-Tier Theming Model

### 2.1 Token Layer — CSS Custom Properties

Defines colors, fonts, spacing, border-radius, shadows. Injected as `<style>` on `:root` before layout renders.

```json
"tokens": {
  "colors": {
    "primary":   { "default": "#2563eb", "dark": "#3b82f6" },
    "secondary": { "default": "#7c3aed", "dark": "#8b5cf6" },
    "bg":        { "default": "#ffffff", "dark": "#0f172a" },
    "text":      { "default": "#1e293b", "dark": "#e2e8f0" }
  },
  "fonts": {
    "heading": { "family": "Inter", "source": "google", "weights": [400,600,700] },
    "body":    { "family": "Inter", "source": "google", "weights": [400,500] }
  },
  "spacing": { "section-padding": "4rem", "container-max": "1280px" },
  "border-radius": { "sm": "0.25rem", "md": "0.5rem", "lg": "1rem" },
  "shadows": { "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)", "md": "..." }
}
```

Rendered at runtime:
```css
:root {
  --yo-primary: #2563eb;
  --yo-bg: #ffffff;
  --yo-text: #1e293b;
  --font-heading: 'Inter', system-ui, sans-serif;
  --spacing-section: 4rem;
  ...
}
```

Tailwind `tailwind.config.css` maps to these variables:
```css
@theme {
  --color-primary: var(--yo-primary);
  --color-bg: var(--yo-bg);
  --font-heading: var(--font-heading);
}
```

### 2.2 Variant Layer — Component UI via ThemeContext

Components consume variant config from the active theme:

```json
"components": {
  "button": {
    "variant": "pill",
    "variants": {
      "pill":     { "classes": "rounded-full px-6 py-3 shadow-md hover:shadow-lg" },
      "sharp":    { "classes": "rounded-none px-4 py-2 border-2 border-primary" },
      "elevated": { "classes": "rounded-lg px-5 py-3 shadow-xl hover:-translate-y-1" }
    }
  },
  "card": {
    "variant": "shadow",
    "variants": {
      "shadow":   { "classes": "rounded-xl shadow-lg overflow-hidden bg-white" },
      "bordered": { "classes": "rounded-lg border-2 overflow-hidden bg-white" },
      "flat":     { "classes": "rounded-none overflow-hidden bg-transparent" }
    }
  }
}
```

Component usage:
```tsx
const { resolveComponent } = useTheme();
const btn = resolveComponent('button');
// btn → { classes: "rounded-full px-6 py-3 shadow-md hover:shadow-lg", iconPos: "left" }

<button className={`inline-flex items-center font-medium ${btn.classes}`}>
  {children}
</button>
```

### 2.3 Structure Layer — React Shell Components

The theme's `structure.layoutType` maps to a React shell component that controls DOM arrangement:

```json
"structure": {
  "layoutType": "sidebar-right",
  "layoutTypes": {
    "sidebar-right": { "shell": "SidebarRightShell" },
    "sidebar-left":  { "shell": "SidebarLeftShell" },
    "topnav":        { "shell": "TopNavShell" },
    "minimal":       { "shell": "MinimalShell" }
  }
}
```

```tsx
const ShellRegistry = { SidebarRightShell, SidebarLeftShell, TopNavShell, MinimalShell };

// In DynamicPage.tsx:
const Shell = ShellRegistry[theme.structure.layoutType] ?? DefaultShell;

<Shell zones={template.zones} layout={layoutDef}>
  <PageRenderer page={page} />
</Shell>
```

Shells control sidebar position, header/footer presence, container width — things CSS cannot safely reorder.

---

## 3. Database Schema

### 3.1 dbo.YOTheme

```sql
CREATE TABLE dbo.YOTheme
(
    YOThemeId               BIGINT IDENTITY(1,1) PRIMARY KEY,
    YOThemeGUID             NVARCHAR(128) NOT NULL,
    Name                    NVARCHAR(200) NOT NULL,
    Slug                    NVARCHAR(200) NOT NULL,
    [Version]               NVARCHAR(20) NOT NULL,
    Author                  NVARCHAR(200) NULL,
    Description             NVARCHAR(1000) NULL,
    Tags                    NVARCHAR(500) NULL,
    Screenshot              NVARCHAR(500) NULL,
    Config                  NVARCHAR(MAX) NULL,          -- Full theme.json content
    IsActive                BIT NOT NULL DEFAULT 0,       -- Only one active at a time
    IsSystem                BIT NOT NULL DEFAULT 0,       -- System default theme
    ParentYOThemeId         BIGINT NULL REFERENCES dbo.YOTheme(YOThemeId),  -- For child themes
    PackagePath             NVARCHAR(1024) NULL,          -- Path to extracted ZIP
    PackageHash             NVARCHAR(128) NULL,           -- SHA256 of uploaded ZIP
    IsActive                BIT NOT NULL DEFAULT 1,
    IsDeleted               BIT NOT NULL DEFAULT 0,
    AddedOn                 DATETIME NOT NULL DEFAULT GETDATE(),
    AddedBy                 BIGINT NOT NULL DEFAULT 0,
    DeletedBy               BIGINT NOT NULL DEFAULT 0,
    DeletedOn               DATETIME NULL,
    UpdatedOn               DATETIME NULL,
    UpdatedBy               BIGINT NOT NULL DEFAULT 0
);
```

### 3.2 dbo.YOThemeOverride

Stores customizer changes (diffs against theme.json):

```sql
CREATE TABLE dbo.YOThemeOverride
(
    YOThemeOverrideId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    YOThemeId               BIGINT NOT NULL REFERENCES dbo.YOTheme(YOThemeId),
    KeyPath                 NVARCHAR(500) NOT NULL,      -- e.g. "tokens.colors.primary"
    Value                   NVARCHAR(MAX) NOT NULL,      -- e.g. "#ff6600"
    AddedOn                 DATETIME NOT NULL DEFAULT GETDATE(),
    AddedBy                 BIGINT NOT NULL DEFAULT 0
);
```

### 3.3 dbo.YOThemeAsset

Tracks files extracted from theme ZIP:

```sql
CREATE TABLE dbo.YOThemeAsset
(
    YOThemeAssetId          BIGINT IDENTITY(1,1) PRIMARY KEY,
    YOThemeId               BIGINT NOT NULL REFERENCES dbo.YOTheme(YOThemeId),
    AssetPath               NVARCHAR(500) NOT NULL,      -- relative path inside ZIP
    AssetType               NVARCHAR(50) NOT NULL,       -- 'font', 'image', 'css'
    FileSize                BIGINT NOT NULL,
    FileHash                NVARCHAR(128) NULL,
    AddedOn                 DATETIME NOT NULL DEFAULT GETDATE()
);
```

### 3.4 ALTER dbo.MasterLayout

```sql
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.MasterLayout') AND name = 'YOThemeId')
    ALTER TABLE dbo.MasterLayout ADD YOThemeId BIGINT NULL REFERENCES dbo.YOTheme(YOThemeId);
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.MasterLayout') AND name = 'LayoutGUID')
    ALTER TABLE dbo.MasterLayout ADD LayoutGUID NVARCHAR(128) NULL;
GO
```

### 3.5 ALTER dbo.Page

```sql
-- Theme association (NULL = use default system theme)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'YOThemeId')
    ALTER TABLE dbo.Page ADD YOThemeId BIGINT NULL REFERENCES dbo.YOTheme(YOThemeId);
GO

-- Template type for hierarchy resolution
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.Page') AND name = 'TemplateType')
    ALTER TABLE dbo.Page ADD TemplateType NVARCHAR(100) NOT NULL DEFAULT 'page';
GO
```

---

## 4. Stored Procedures

### Naming Convention

All theme SPs follow: `usp_YOTheme_{Action}`

| SP | Description |
|---|---|
| `usp_YOTheme_Save` | Insert or update a theme (upsert by YOThemeGUID) |
| `usp_YOTheme_Get` | Get single theme by GUID or ID |
| `usp_YOTheme_List` | List all themes (with pagination) |
| `usp_YOTheme_Delete` | Soft-delete a theme |
| `usp_YOTheme_Activate` | Set one theme active, deactivate others |
| `usp_YOTheme_GetActive` | Get the currently active theme |
| `usp_YOTheme_GetOverrides` | Get all overrides for a theme |
| `usp_YOTheme_SaveOverride` | Upsert a single override key |
| `usp_YOTheme_ClearOverrides` | Remove all overrides for a theme |
| `usp_YOTheme_AddAsset` | Register an extracted asset |
| `usp_YOTheme_GetAssets` | List assets for a theme |

### SP Pattern

```sql
-- ============================================================
-- Stored Procedure: usp_YOTheme_Save
-- Description: Insert or update a theme (upsert by YOThemeGUID)
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Save') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Save
GO

CREATE PROCEDURE dbo.usp_YOTheme_Save
    @YOThemeGUID    NVARCHAR(128),
    @Name           NVARCHAR(200),
    @Slug           NVARCHAR(200),
    @Version        NVARCHAR(20),
    @Author         NVARCHAR(200) = NULL,
    @Description    NVARCHAR(1000) = NULL,
    @Tags           NVARCHAR(500) = NULL,
    @Config         NVARCHAR(MAX) = NULL,
    @IsSystem       BIT = 0,
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ExistingId BIGINT;

    SELECT @ExistingId = YOThemeId
    FROM dbo.YOTheme
    WHERE YOThemeGUID = @YOThemeGUID AND IsDeleted = 0;

    IF @ExistingId IS NULL
    BEGIN
        INSERT INTO dbo.YOTheme (
            YOThemeGUID, Name, Slug, [Version],
            Author, Description, Tags, Config,
            IsSystem,
            AddedBy, UpdatedBy
        ) VALUES (
            @YOThemeGUID, @Name, @Slug, @Version,
            @Author, @Description, @Tags, @Config,
            @IsSystem,
            @UpdatedBy, @UpdatedBy
        );

        SELECT SCOPE_IDENTITY() AS YOThemeId, 'inserted' AS Action;
    END
    ELSE
    BEGIN
        UPDATE dbo.YOTheme
        SET
            Name        = @Name,
            Slug        = @Slug,
            [Version]   = @Version,
            Author      = @Author,
            Description = @Description,
            Tags        = @Tags,
            Config      = @Config,
            IsSystem    = @IsSystem,
            UpdatedOn   = GETDATE(),
            UpdatedBy   = @UpdatedBy
        WHERE YOThemeId = @ExistingId;

        SELECT @ExistingId AS YOThemeId, 'updated' AS Action;
    END
END
GO
```

### usp_YOTheme_Activate

```sql
-- ============================================================
-- Stored Procedure: usp_YOTheme_Activate
-- Description: Set a single theme as active, deactivate others
-- ============================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'dbo.usp_YOTheme_Activate') AND type in (N'P', N'PC'))
    DROP PROCEDURE dbo.usp_YOTheme_Activate
GO

CREATE PROCEDURE dbo.usp_YOTheme_Activate
    @YOThemeGUID    NVARCHAR(128),
    @UpdatedBy      BIGINT = 0
AS
BEGIN
    SET NOCOUNT ON;

    -- Deactivate all themes
    UPDATE dbo.YOTheme SET IsActive = 0, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE IsActive = 1 AND IsDeleted = 0;

    -- Activate the target theme
    UPDATE dbo.YOTheme SET IsActive = 1, UpdatedOn = GETDATE(), UpdatedBy = @UpdatedBy
    WHERE YOThemeGUID = @YOThemeGUID AND IsDeleted = 0;

    IF @@ROWCOUNT = 0
    BEGIN
        SELECT NULL AS YOThemeId, 'not_found' AS Action;
        RETURN;
    END

    SELECT YOThemeId, 'activated' AS Action
    FROM dbo.YOTheme
    WHERE YOThemeGUID = @YOThemeGUID;
END
GO
```

---

## 5. Theme Package Format (ZIP)

A theme is a `.yo-theme` ZIP file — self-contained, installable product.

```
modern-biz-1.0.0.yo-theme
├── manifest.json                    # REQUIRED — theme identity
├── preview.png                      # REQUIRED — 1200×900 marketplace thumbnail
├── theme.json                       # REQUIRED — tokens + components + structure
│
├── assets/
│   ├── css/
│   │   └── overrides.css            # Custom CSS (animations, keyframes)
│   ├── fonts/
│   │   ├── inter-variable.woff2     # Self-hosted fonts
│   │   └── fontface.css             # @font-face declarations
│   └── images/
│       ├── logo.svg                 # Default brand assets
│       └── hero-bg.jpg
│
├── layouts/
│   ├── default.json                 # Main layout definition
│   ├── blog.json                    # Blog listing layout
│   └── full-width.json
│
├── templates/
│   ├── home.json                    # Homepage template
│   ├── page.json                    # Default page template
│   ├── blog.json                    # Blog listing template
│   ├── blog-post.json               # Single post template
│   ├── landing.json                 # Landing page
│   ├── search.json                  # Search results
│   └── 404.json                     # 404 page
│
├── components/
│   ├── button.json                  # Component definition
│   ├── card.json
│   └── navbar.json
│
└── demo/
    ├── pages.json                   # Demo pages (sections + components)
    └── settings.json                # Default site settings
```

### File Size Budget

| Category | Max Size | Notes |
|---|---|---|
| `preview.png` | 2 MB | 1200×900, progressive JPEG or PNG |
| Font files | 5 MB total | WOFF2 only |
| Images | 10 MB total | Optimize for web |
| All JSON | 500 KB | Configuration only |
| **Total ZIP** | **20 MB** | Reasonable for web upload |

---

## 6. Theme Manifest

### manifest.json

```json
{
  "formatVersion": "1.0",
  "name": "Modern Biz",
  "slug": "modern-biz",
  "version": "1.0.0",
  "requires": ">=1.0.0",
  "author": {
    "name": "YoThemes",
    "url": "https://yothemes.com"
  },
  "tags": ["business", "corporate", "landing"],
  "description": "Clean modern business theme with dark mode.",
  "screenshot": "preview.png",
  "layouts": ["default", "blog", "full-width"],
  "templates": ["home", "page", "blog", "blog-post", "landing", "404", "search"],
  "components": ["button", "card", "navbar"],
  "dependencies": {
    "plugins": [],
    "themes": []
  },
  "childTheme": false
}
```

### theme.json

Full example with tokens, components, structure, and customizer schema — see [Three-Tier Theming Model](#2-three-tier-theming-model) above for the complete shape.

### Layout File (layouts/default.json)

```json
{
  "name": "Default Layout",
  "description": "Main site layout with sidebar",
  "shell": "SidebarRightShell",
  "zones": {
    "header":  { "order": 0, "container": "full" },
    "main":    { "order": 1, "container": "boxed" },
    "sidebar": { "order": 2, "container": "boxed", "width": "320px" },
    "footer":  { "order": 3, "container": "full" }
  },
  "components": {
    "header-brand": { "type": "brand-logo", "config": { "logoSize": "md" } },
    "header-nav":   { "type": "html-nav", "config": {} },
    "footer-text":  { "type": "html-text", "config": { "content": "© 2025" } }
  }
}
```

### Template File (templates/page.json)

```json
{
  "name": "Default Page",
  "description": "Standard content page",
  "layout": "default",
  "thumbnail": "thumb-page.png",
  "zones": {
    "header":  ["zone-header"],
    "main":    ["zone-content"],
    "sidebar": ["zone-sidebar"],
    "footer":  ["zone-footer"]
  },
  "settings": {
    "showTitle": true,
    "showBreadcrumb": true,
    "sidebarVisible": true
  }
}
```

---

## 7. Template Hierarchy

Resolved on each request. Follows WordPress-inspired precedence:

```
REQUEST: /about-us
  Page.TemplateType = "page"
  Page.Slug = "about-us"

RESOLUTION (in order):
  1. templates/page-about-us.json        (page-specific — highest priority)
  2. templates/page.json                 (by template type)
  3. templates/default.json              (fallback template)
  4. layouts/default.json                (ultimate fallback — no template)
```

```
REQUEST: /blog/my-post-title
  Page.TemplateType = "blog-post"
  Page.Slug = "my-post-title"

RESOLUTION:
  1. templates/blog-post-my-post-title.json  (post-specific)
  2. templates/blog-post.json                (by template type)
  3. templates/page.json                     (generic page fallback)
  4. templates/default.json
  5. layouts/default.json
```

```
REQUEST: / (homepage)
  Page.TemplateType = "home"
  Page.Slug = "home"

RESOLUTION:
  1. templates/home.json         (by template type — no slug for root)
  2. templates/default.json
  3. layouts/default.json
```

### How Resolution Works

```ts
interface TemplateResolver {
  theme: ParsedTheme;
  templateType: string;     // Page.TemplateType (e.g. "page", "blog-post", "home")
  slug: string;             // Page.Slug (e.g. "about-us")
}

function resolveTemplate(resolver: TemplateResolver): ResolvedTemplate {
  const { theme, templateType, slug } = resolver;

  // 1. Try page-specific override
  if (slug && theme.templates[`${templateType}-${slug}`]) {
    return theme.templates[`${templateType}-${slug}`];
  }

  // 2. Try generic template type
  if (theme.templates[templateType]) {
    return theme.templates[templateType];
  }

  // 3. Try default template
  if (theme.templates.default) {
    return theme.templates.default;
  }

  // 4. Ultimate fallback — create from first layout
  const firstLayout = Object.keys(theme.layouts)[0];
  return {
    name: 'Auto Fallback',
    layout: firstLayout || 'default',
    zones: {}
  };
}
```

---

## 8. Admin Flow

### 8.1 Theme Manager

```
Admin → Appearance → Themes
         │
         ▼
    ┌─ Installed Themes ─────────────────────────────────┐
    │   ┌──────────┐  ┌──────────┐  ┌──────────┐         │
    │   │ Modern   │  │ My Child │  │ Twenty   │         │
    │   │ Biz      │  │ Theme    │  │ Four     │         │
    │   │ ● ACTIVE │  │          │  │          │         │
    │   │          │  │          │  │          │         │
    │   │ v1.0.0   │  │ v1.0.0   │  │ v1.0.0   │         │
    │   └──────────┘  └──────────┘  └──────────┘         │
    │      │              │              │                │
    │   [Customize]   [Activate]    [Activate]            │
    │   [Child]       [Export]      [Export]              │
    │   [Export]                                         │
    │                                                     │
    │   [+ Add New Theme]  [+ Upload ZIP]                 │
    └─────────────────────────────────────────────────────┘
```

### 8.2 Install Flow

```
User clicks "Upload ZIP"
  │
  ▼
Select .yo-theme file (drag-drop or file picker)
  │
  ▼
POST /api/v1/yotheme/install (multipart)
  │
  ▼
Server:
  1. Validate ZIP structure
     ├─ manifest.json exists + valid JSON
     ├─ theme.json exists + valid JSON
     ├─ layouts/ has at least one layout
     ├─ preview.png exists
     └─ Format version is supported
  2. Check slug uniqueness
  3. Extract to /uploads/themes/{slug}/
  4. Parse manifest → INSERT dbo.YOTheme
  5. Parse layouts → INSERT/UPDATE dbo.MasterLayout with YOThemeId
  6. Register assets → INSERT dbo.YOThemeAsset
  7. Hash package → Store PackageHash
  │
  ▼
Response: Theme installed
  ┌─────────────────────────────────┐
  │  ✓ Modern Biz v1.0.0 installed │
  │  [Activate] [Customize] [Close]  │
  └─────────────────────────────────┘
```

### 8.3 Activate Flow

```
User clicks "Activate"
  │
  ▼
POST /api/v1/yotheme/activate { YOThemeGUID }
  │
  ▼
Server:
  1. EXEC usp_YOTheme_Activate
     → Deactivates all themes, activates target
  2. Build theme: parse theme.json into config
  3. Invalidate ALL public page caches
  4. Return success
  │
  ▼
Frontend:
  - Theme grid updates: new theme shows "ACTIVE"
  - Admin UI reloads to show new theme's customizer options
  - Public site immediately shows new theme (after cache rebuild)
```

### 8.4 Delete Flow

```
User clicks "Delete"
  │
  ▼
Confirm dialog: "Also delete layouts using this theme?"
  │
  ▼
POST /api/v1/yotheme/delete { YOThemeGUID, cascadeLayouts: true|false }
  │
  ▼
Server:
  1. Delete assets from disk (/uploads/themes/{slug}/)
  2. Delete YOThemeAsset records
  3. If cascade: delete referenced MasterLayout records
     Else: set MasterLayout.YOThemeId = NULL
  4. If active: activate system default theme
  5. Soft-delete YOTheme record
  6. Invalidate all public caches
```

---

## 9. Public Rendering Flow

### 9.1 Sequence Diagram

```
Browser              DynamicPageLoader        Server (ASP.NET)         DB              PublicPageCache
   │                       │                       │                   │                   │
   │  GET /about-us        │                       │                   │                   │
   │──────────────────────>│                       │                   │                   │
   │                       │  useGetPublicPageQuery │                   │                   │
   │                       │──────────────────────>│                   │                   │
   │                       │                       │  TryGet(slug)     │                   │
   │                       │                       │───────────────────│──────────────────>│
   │                       │                       │<──────────────────│──────────────────│
   │                       │                       │                   │                   │
   │                       │                       │  if MISS:         │                   │
   │                       │                       │  GetPage(slug)    │                   │
   │                       │                       │──────────────────>│                   │
   │                       │                       │<──────────────────│                   │
   │                       │                       │  GetTheme(themeId)│                   │
   │                       │                       │──────────────────>│                   │
   │                       │                       │<──────────────────│                   │
   │                       │                       │  GetLayout(layout)│                   │
   │                       │                       │──────────────────>│                   │
   │                       │                       │<──────────────────│                   │
   │                       │                       │                   │                   │
   │                       │                       │  ResolveTemplate  │                   │
   │                       │                       │  Build response   │                   │
   │                       │                       │  Set(slug, resp)  │                   │
   │                       │                       │──────────────────────────────────────>│
   │                       │                       │                   │                   │
   │                       │<──────────────────────│                   │                   │
   │                       │                       │                   │                   │
   │                       │  mapPublicPageToYoPage│                   │                   │
   │                       │  → YoPage             │                   │                   │
   │                       │                       │                   │                   │
   │  <DynamicPage>        │                       │                   │                   │
   │  ├─ <ThemeProvider>    │                       │                   │                   │
   │  ├─ <Shell>            │                       │                   │                   │
   │  ├─ <style>:root{…}    │                       │                   │                   │
   │  ├─ Google Fonts <link>│                       │                   │                   │
   │  └─ <PageRenderer>     │                       │                   │                   │
   │                       │                       │                   │                   │
   │<──────────────────────│                       │                   │                   │
   │                       │                       │                   │                   │
```

### 9.2 Client-Side Rendering (DynamicPage.tsx)

```tsx
export default function DynamicPage({ page }: DynamicPageProps) {
  // themeConfig is embedded in the API response and mapped to YoPage
  if (!page || !page.themeConfig) return null;

  const theme = page.themeConfig;
  const template = resolveTemplate(theme, page.templateType, page.slug);
  const layout = theme.layouts[template.layout] ?? theme.layouts[Object.keys(theme.layouts)[0]];
  const Shell = ShellRegistry[theme.structure.layoutType] ?? DefaultShell;

  // Build CSS variable string
  const cssVars = buildTokenCss(theme.tokens);

  return (
    <ThemeProvider theme={theme} template={template} layout={layout}>
      {/* Inject CSS variables */}
      <style>{`:root { ${cssVars} }`}</style>
      {/* Inject Google Fonts */}
      {theme.tokens.fonts && <GoogleFontLoader fonts={theme.tokens.fonts} />}
      {/* Render shell with page content */}
      <Shell layout={layout} template={template}>
        <PageRenderer page={page} />
      </Shell>
    </ThemeProvider>
  );
}
```

### 9.3 Component Variant Resolution

```tsx
// Inside a component (e.g. BaseButton.tsx)
import { useTheme } from '../../context/ThemeContext';

export function BaseButton({ children, onClick, className = '' }) {
  const { resolveComponent } = useTheme();
  const variant = resolveComponent('button'); // reads current theme's button variant

  // Variant classes < user-set classes (from page builder)
  const allClasses = `${variant.classes} ${className}`;

  return (
    <button className={allClasses} onClick={onClick}>
      {children}
    </button>
  );
}
```

ThemeContext implementation:

```tsx
const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeContextValue {
  theme: ParsedTheme;
  template: ResolvedTemplate;
  layout: ResolvedLayout;
  resolveComponent: (type: string) => { classes: string; [key: string]: unknown };
  resolveToken: (path: string) => string;
}

export function ThemeProvider({ theme, template, layout, children }) {
  const value = useMemo(() => ({
    theme,
    template,
    layout,
    resolveComponent: (type: string) => {
      const comp = theme.components?.[type];
      if (!comp) return { classes: '' };
      const variantKey = comp.variant;
      return comp.variants?.[variantKey] ?? { classes: '' };
    },
    resolveToken: (path: string) => {
      // e.g. "colors.primary" → theme.tokens.colors.primary.default
      const parts = path.split('.');
      let val: unknown = theme.tokens;
      for (const part of parts) {
        val = (val as Record<string, unknown>)?.[part];
      }
      return typeof val === 'string' ? val : String(val ?? '');
    },
  }), [theme, template, layout]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
```

---

## 10. Theme Customizer

### 10.1 Customizer UI

```
Admin → Appearance → Customize

  ┌──────────────────────────────────────────────────────┐
  │  Modern Biz  [Desktop ▼]  [Save] [Publish]           │
  ├──────────────────────────────────────────────────────┤
  │  ≡ Customize           │  ┌────────────────────────┐ │
  │  │                      │  │                        │ │
  │  ├─ Colors ──────────── │  │   LIVE PREVIEW         │ │
  │  │  Primary    [■]    │  │   (full page render)    │ │
  │  │  Secondary  [■]    │  │                        │ │
  │  │  Background [■]    │  │   # My Page Title       │ │
  │  │  Text       [■]    │  │                        │ │
  │  │                     │  │   Content here...      │ │
  │  ├─ Fonts ──────────── │  │                        │ │
  │  │  Heading [Inter ▼] │  │                        │ │
  │  │  Body    [Inter ▼] │  │                        │ │
  │  │                     │  │                        │ │
  │  ├─ Layout ───────────│  │                        │ │
  │  │  Style [Sidebar ▼] │  │                        │ │
  │  │                     │  │                        │ │
  │  ├─ Components ───────│  │                        │ │
  │  │  Button [Pill ▼]  │  │                        │ │
  │  │  Card   [Shadow ▼] │  │                        │ │
  │  │                     │  │                        │ │
  │  ├─ CSS ──────────────│  │                        │ │
  │  │  textarea {...}    │  │                        │ │
  │  │                     │  │                        │ │
  │  └─ Advanced ─────────│  │                        │ │
  │     Child Theme [Save]│  │                        │ │
  └──────────────────────────┘  └────────────────────────┘
```

### 10.2 Customizer Save Flow

```
User changes Primary color #2563eb → #ff6600
  │
  ▼
Immediate: 
  - Local React state updates
  - CSS var --yo-primary becomes #ff6600 in preview
  - Preview re-renders instantly (no server call)
  │
  ▼
User clicks "Save"
  │
  ▼
POST /api/v1/yotheme/save-overrides
{
  "themeGuid": "...",
  "overrides": {
    "tokens.colors.primary": "#ff6600",
    "components.button.variant": "sharp"
  }
}
  │
  ▼
Server:
  1. EXEC usp_YOTheme_SaveOverride for each key
  2. Invalidate all pages referencing this theme
  3. Return success
  │
  ▼
Save button shows "Saved"
  │
  ▼
After save, offer:
  [✓] Continue customizing
  [ ] Export as Child Theme (download ZIP)
  [ ] Publish to live site (already live after cache invalidate)
```

### 10.3 Customizer State Management

```tsx
// Customizer state lives entirely on the client during editing
interface CustomizerState {
  baseTheme: ParsedTheme;              // Original theme.json
  overrides: Record<string, unknown>;  // Changed values only
  previewTheme: ParsedTheme;          // Deep merge of base + overrides
  dirty: boolean;
}

// Any change:
// 1. Updates overrides[key] = value
// 2. Recomputes previewTheme = deepMerge(baseTheme, overrides)
// 3. Preview re-renders with previewTheme
// 4. No server calls until Save
```

---

## 11. Child Themes

### 11.1 Concept

A child theme inherits everything from a parent theme, then overrides only specific files/values.

**When to use:**
- User buys "Modern Biz" and wants their own colors + logo
- Parent theme updates → child gets fixes automatically
- Overrides are stored as a tiny ZIP (< 100 KB)

### 11.2 Child Theme JSON

```json
// child-theme/child.json
{
  "parent": "modern-biz",
  "parentVersion": ">=1.0.0 <2.0.0",
  "name": "Modern Biz - Blue Edition",
  "slug": "modern-biz-blue",
  "version": "1.0.0",
  "author": { "name": "Customer" },
  "description": "My custom variant of Modern Biz",
  "screenshot": "preview.png"
}
```

### 11.3 Override Resolution Order

```
For any file / value lookup:
  1. Child theme file        (if exists)
  2. Parent theme file       (fallback)

For JSON merge (theme.json):
  - Deep merge child into parent
  - Child values win at any depth
```

```
Example: child-theme/theme.json
{
  "tokens": {
    "colors": {
      "primary": "#ff6600"          // Only this key is overridden
    }                               // All other colors inherit from parent
  },
  "components": {
    "button": {
      "variant": "sharp"            // Override variant selection
    }
  }
}
```

### 11.4 Create Child Theme from Customizer

```
User customizes theme and clicks "Save as Child Theme"
  │
  ▼
Server:
  1. Read all YOThemeOverride records for current theme
  2. Build child theme JSON with only changed values
  3. Generate ZIP containing:
     ├── child.json         (points to parent)
     ├── theme.json         (only overrides)
     ├── preview.png        (optional custom screenshot)
     └── assets/            (only custom assets)
  4. Return ZIP for download
  │
  ▼
User downloads {slug}-child-1.0.0.yo-theme
  (typically 5-100 KB)
```

### 11.5 Activation

Child theme activation = parent theme auto-loaded first, then child overrides applied on top.

When the parent theme updates (e.g. from marketplace), the child theme automatically gets fixes — only the overridden values stay custom.

---

## 12. Export & Import

### 12.1 Export Active Theme

```
Admin → Theme → Export
  │
  ├─ "Export Full Theme"
  │   1. Read theme.json from dbo.YOTheme.Config
  │   2. Merge YOThemeOverride records on top (customizer changes)
  │   3. Read all assets from /uploads/themes/{slug}/
  │   4. Read all layouts with this YOThemeId
  │   5. Package into ZIP:
  │      manifest.json + theme.json (with overrides baked in)
  │      + layouts/ + assets/
  │   6. Download {slug}-{version}.yo-theme
  │
  └─ "Export as Child Theme"
      1. Read only YOThemeOverride records
      2. Generate child.json pointing to parent
      3. Package: child.json + theme.json (overrides only) + custom screenshot
      4. Download {slug}-child-{version}.yo-theme
```

### 12.2 Import

```
Admin → Themes → Add New → Upload ZIP
  │
  ▼
POST /api/v1/yotheme/import (multipart)
  │
  ▼
Server:
  1. Validate ZIP (same as install)
  2. Check slug conflict:
     ├─ If new slug → install as new
     ├─ If existing slug:
        ├─ If same version → "Already installed"
        ├─ If newer version → "Upgrade?" (preserves overrides)
        └─ If different → "Overwrite?" or "Install as {slug}-2?"
  3. Extract files, register theme, import layouts
  4. Optionally import demo content if present
  5. Return success with preview
```

### 12.3 Marketplace Format

The export format is the same as the install format — `.yo-theme` ZIP. This means any exported theme can be:
- Shared via email
- Sold on a marketplace
- Uploaded to any YO-Framework instance
- Imported as-is with all data (layouts, components, demo content, assets)

---

## 13. Cache Strategy

### 13.1 Current Cache (PublicPageCache)

| Detail | Value |
|---|---|
| Type | In-memory (IMemoryCache) |
| Key | `public_page_{slug}` |
| TTL | 4 hours |
| Invalidation | Tag-based (PAGE_TAG, LAYOUT_TAG) |

### 13.2 Theme-Aware Changes

| Change | What to Invalidate |
|---|---|
| Theme activated | ALL public page caches (all slugs) |
| Theme saved (config changed) | ALL pages referencing this theme |
| Theme override saved | ALL pages referencing this theme |
| Layout saved (with theme) | ALL pages using this layout |
| Page published | Only this page's cache entry |
| Child theme activated | ALL public page caches |

### 13.3 Cache Key

New cache key structure:

```
public_page_{slug}_{locale}
```

No need to include theme slug in key because theme is resolved at build time and baked into the cached response. When theme changes, all caches are invalidated.

### 13.4 Theme Config Cache

Since `theme.json` can be large and is read on every miss:

```
Cache key: theme_config_{themeSlug}
TTL: 1 hour (or until theme is saved)
```

Separate from page cache so theme data doesn't need re-fetching from DB on every miss.

---

## 14. Developing a Theme (Dev Guide)

### 14.1 Quick Start — Create a Theme from Scratch

```
Step 1: Scaffold the folder structure
─────────────────────────────────────

mkdir my-theme
cd my-theme
mkdir assets assets/css assets/fonts assets/images
mkdir layouts templates components demo
```

```
Step 2: Create manifest.json
─────────────────────────────

{
  "formatVersion": "1.0",
  "name": "My First Theme",
  "slug": "my-first-theme",
  "version": "1.0.0",
  "author": { "name": "Your Name" },
  "tags": ["custom"],
  "screenshot": "preview.png",
  "layouts": ["default"],
  "templates": ["page", "home"],
  "components": ["button", "card"]
}
```

```
Step 3: Create theme.json
──────────────────────────

{
  "tokens": {
    "colors": {
      "primary":   { "default": "#2563eb" },
      "secondary": { "default": "#7c3aed" },
      "bg":        { "default": "#ffffff" },
      "text":      { "default": "#1e293b" }
    },
    "fonts": {
      "heading": { "family": "Inter", "source": "google", "weights": [400, 600] },
      "body":    { "family": "Inter", "source": "google", "weights": [400] }
    },
    "spacing": { "section-padding": "4rem", "container-max": "1280px" },
    "border-radius": { "md": "0.5rem" }
  },
  "components": {
    "button": {
      "variant": "pill",
      "variants": {
        "pill":     { "classes": "rounded-full px-6 py-3 shadow-md" },
        "sharp":    { "classes": "rounded-none px-4 py-2 border-2" }
      }
    },
    "card": {
      "variant": "shadow",
      "variants": {
        "shadow":   { "classes": "rounded-xl shadow-lg overflow-hidden" },
        "bordered": { "classes": "rounded-lg border-2 overflow-hidden" },
        "flat":     { "classes": "rounded-none overflow-hidden" }
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
        "primary":   { "type": "color", "label": "Primary" },
        "secondary": { "type": "color", "label": "Secondary" }
      },
      "fonts": {
        "heading": { "type": "font", "label": "Heading Font" }
      },
      "components": {
        "button": {
          "type": "select",
          "label": "Button Style",
          "options": [
            { "value": "pill", "label": "Pill" },
            { "value": "sharp", "label": "Sharp" }
          ]
        }
      }
    }
  }
}
```

```
Step 4: Create a layout
────────────────────────

layouts/default.json:
{
  "name": "Default Layout",
  "shell": "SidebarRightShell",
  "zones": {
    "header":  { "order": 0 },
    "main":    { "order": 1 },
    "sidebar": { "order": 2 },
    "footer":  { "order": 3 }
  }
}
```

```
Step 5: Create a template
───────────────────────────

templates/page.json:
{
  "name": "Default Page",
  "layout": "default",
  "zones": {
    "header":  ["zone-header"],
    "main":    ["zone-content"],
    "sidebar": ["zone-sidebar"],
    "footer":  ["zone-footer"]
  }
}
```

```
Step 6: Add component definitions
───────────────────────────────────

components/button.json:
{
  "type": "button",
  "label": "Button",
  "configSchema": [
    { "key": "label", "type": "text", "label": "Text", "default": "Click Me" },
    { "key": "url",   "type": "url",  "label": "URL" }
  ],
  "defaultConfig": { "label": "Click Me" },
  "renderer": "BaseButton",
  "themeAware": true
}
```

```
Step 7: Create preview screenshot
───────────────────────────────────

Create a 1200×900 preview.png showing your theme's design.
This is used in the theme grid and marketplace.

Tools: Figma, Penpot, or take a screenshot of your rendered page.
```

```
Step 8: Add demo content (optional)
─────────────────────────────────────

demo/pages.json:
[
  {
    "title": "Home",
    "slug": "home",
    "templateType": "home",
    "sections": [
      {
        "name": "Hero",
        "columns": [{ "components": ["hero-title", "hero-cta"] }]
      },
      {
        "name": "Features",
        "columns": [
          { "components": ["feature-card"] },
          { "components": ["feature-card"] }
        ]
      }
    ]
  }
]

demo/settings.json:
{
  "websiteName": "My Theme Demo",
  "description": "Powered by My First Theme"
}
```

```
Step 9: Package the theme
────────────────────────────

zip -r my-first-theme-1.0.0.yo-theme \
  manifest.json \
  theme.json \
  preview.png \
  assets/ \
  layouts/ \
  templates/ \
  components/ \
  demo/
```

```
Step 10: Install
──────────────────

Admin → Appearance → Themes → Add New → Upload ZIP
Select my-first-theme-1.0.0.yo-theme
Click "Activate"
```

### 14.2 Minimum Viable Theme

Minimum files needed for a working theme:

```
minimal-theme-1.0.0.yo-theme
├── manifest.json        # Required
├── theme.json           # Required — at minimum: tokens.colors.primary
├── preview.png          # Required
└── layouts/
    └── default.json     # Required — at minimum: shell + zones
```

### 14.3 Tailwind Guidelines

- **Do NOT** use hardcoded colors like `bg-blue-600` — use `bg-primary` (CSS variable maps to `var(--yo-primary)`)
- **Do NOT** use hardcoded font sizes like `text-2xl` for headings — use `font-heading` (maps to `var(--font-heading)`)
- **DO** use Tailwind utility classes for spacing, layout, transitions, effects
- **DO** define component variants in theme.json — users can switch them in customizer
- **DO** keep `variants` under 4 options per component — too many choices overwhelm users

### 14.4 Component Naming

| Component type | Prefix | Example |
|---|---|---|
| Layout | `layout-` | `layout-header`, `layout-footer` |
| Content | `content-` | `content-hero`, `content-features` |
| UI | `ui-` | `ui-button`, `ui-card`, `ui-form` |
| Media | `media-` | `media-image`, `media-video`, `media-gallery` |
| Data | `data-` | `data-table`, `data-list`, `data-chart` |

### 14.5 Testing Checklist

Before packaging a theme, verify:

- [ ] Manifest has all required fields
- [ ] theme.json has at least `tokens.colors.primary` and `structure.layoutType`
- [ ] At least one layout file exists
- [ ] Layout referenced in template exists
- [ ] Shell referenced in layout exists in ShellRegistry
- [ ] Component definitions have matching `type` key
- [ ] Screenshot is 1200×900, valid image
- [ ] ZIP structure matches expected format
- [ ] Self-hosted fonts: include `fontface.css` AND actual `.woff2` files
- [ ] Google Fonts: `source: "google"` with correct family name
- [ ] No hardcoded Tailwind colors that break on dark mode
- [ ] All asset paths are relative (no absolute paths)

### 14.6 Tools

| Tool | Purpose |
|---|---|
| `zip` | Package theme |
| `node theme-validator.js` | Validate ZIP structure |
| `node preview-screenshot.js` | Generate preview from page render |
| Admin customizer | Test live preview before packaging |

---

## 15. Implementation Phases

| Phase | Deliverable | Backend | Frontend | DB |
|---|---|---|---|---|
| **P1** | YOTheme table + CRUD | YOThemeController, Service, SPs | ThemeManager.tsx (grid) | YOTheme table |
| **P2** | ZIP parser + installer | ThemePackageService, ZIP validation | Upload UI, progress | YOThemeAsset, PackagePath |
| **P3** | Theme activation | usp_YOTheme_Activate + cache invalidation | Activate button, UI state | IsActive flag |
| **P4** | Link layouts to themes | ALTER MasterLayout, update layout editor | Layout picker shows themes | MasterLayout.YOThemeId |
| **P5** | Token injection | PublicPageCache builds CSS vars from theme | Inject <style> in DynamicPage | — |
| **P6** | Variant layer | API returns themeConfig in page response | ThemeContext, useTheme() | — |
| **P7** | Structure layer | — | ShellRegistry, shell components | — |
| **P8** | Template hierarchy | TemplateResolver on server | TemplateResolver on client | Page.TemplateType |
| **P9** | Theme customizer | Override CRUD, save endpoint | Customizer.tsx, postMessage | YOThemeOverride |
| **P10** | Child themes | Child ZIP generation, parent fallback | "Create Child" button | ParentYOThemeId |
| **P11** | Export/Import | Export ZIP builder, import validator | Download/Upload UI | — |
| **P12** | Demo content | Install demo pages on activation | — | demo/pages.json parsing |

### Dependencies Between Phases

```
P1 ──> P2 ──> P3 ──> P4 ──> P5 ──> P6 ──> P7 ──> P8
                              │                 │
                              └────> P9 ──> P10 ──> P11 ──> P12
```

P1-P3 are foundational (table, install, activate).  
P4-P5 make themes visible on the site.  
P6-P8 are the three-tier rendering.  
P9-P10 are the admin experience.  
P11-P12 are distribution features.

---

## Appendix: Key C# Types

```csharp
// YOTheme entity
public class YOTheme
{
    public long YOThemeId { get; set; }
    public string YOThemeGUID { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Author { get; set; }
    public string Description { get; set; }
    public string Tags { get; set; }
    public string Screenshot { get; set; }
    public string Config { get; set; }           // Full theme.json
    public bool IsActive { get; set; }
    public long? ParentYOThemeId { get; set; }
    public bool IsDeleted { get; set; }
}

// YOThemeOverride — one row per customizer change
public class YOThemeOverride
{
    public long YOThemeOverrideId { get; set; }
    public long YOThemeId { get; set; }
    public string KeyPath { get; set; }           // "tokens.colors.primary"
    public string Value { get; set; }             // "#ff6600"
}

// Request / Response DTOs
public class YOThemeSaveRequest
{
    public string YOThemeGUID { get; set; }
    public string Name { get; set; }
    public string Slug { get; set; }
    public string Version { get; set; }
    public string Config { get; set; }            // theme.json content
}

public class YOThemeActivateRequest
{
    public string YOThemeGUID { get; set; }
}

public class YOThemeOverrideSaveRequest
{
    public string YOThemeGUID { get; set; }
    public Dictionary<string, object> Overrides { get; set; }
}

public class YOThemePackageValidationResult
{
    public bool Valid { get; set; }
    public List<string> Errors { get; set; }
    public YOThemeSaveRequest ParsedTheme { get; set; }
}
```

---

## Appendix: Key Frontend Types

```tsx
// Parsed from theme.json
interface ParsedTheme {
  name: string;
  slug: string;
  version: string;
  tokens: ThemeTokens;
  components: Record<string, ComponentVariantConfig>;
  structure: ThemeStructure;
  layouts: Record<string, LayoutDefinition>;
  templates: Record<string, TemplateDefinition>;
  customizer: CustomizerSchema;
}

interface ThemeTokens {
  colors: Record<string, { default: string; dark?: string }>;
  fonts: Record<string, FontConfig>;
  spacing: Record<string, string>;
  'border-radius': Record<string, string>;
  shadows: Record<string, string>;
}

interface ComponentVariantConfig {
  variant: string;
  variants: Record<string, { classes: string; [key: string]: unknown }>;
}

interface ThemeStructure {
  layoutType: string;
  layoutTypes: Record<string, { shell: string }>;
}

interface LayoutDefinition {
  name: string;
  shell: string;
  zones: Record<string, { order: number }>;
  components?: Record<string, LayoutComponentRef>;
}

interface TemplateDefinition {
  name: string;
  layout: string;
  zones: Record<string, string[]>;
  settings?: Record<string, unknown>;
}

interface CustomizerSchema {
  controls: Record<string, Record<string, CustomizerControlDef>>;
}

interface CustomizerControlDef {
  type: 'color' | 'font' | 'select' | 'text' | 'css';
  label: string;
  options?: Array<{ value: string; label: string }>;
}
```
