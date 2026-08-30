/* ============================================================================
   YOTheme Studio — Canonical Schema (single source of truth)
   Provider: SQL Server

   Consolidates the theme data model formerly spread across:
     - 1.0.0/.../1.install.sql   (YOTheme, YOThemeOverride, YOThemeAsset + default theme seed)
     - 1.1.0/.../002_theme_studio.sql  (studio lifecycle columns + blueprint §101 tables)
     - 1.2.0/.../001_theme_studio_phase2_6.sql (phase 2-6 tables)

   This file is idempotent (safe to re-run). It MUST be applied together with
   themestudio.sps.sql to create a complete theme runtime.
   ========================================================================== */

IF OBJECT_ID('dbo.YOTheme', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOTheme
    (
        YOThemeId                    int identity(1,1) primary key,
        YOThemeUniqueId              nvarchar(256) NOT NULL,
        Name                         nvarchar(256) NOT NULL,
        Slug                         nvarchar(256) NOT NULL,
        [Version]                    nvarchar(20) NOT NULL,
        Author                       nvarchar(256) NULL,
        Description                  NVARCHAR(1000) NULL,
        Tags                         nvarchar(500) NULL,
        Screenshot                   nvarchar(500) NULL,
        Config                       nvarchar(max) NULL,
        IsSystem                     bit NOT NULL DEFAULT 0,
        ParentYOThemeId              int NULL,
        PackagePath                  nvarchar(1024) NULL,
        PackageHash                  nvarchar(128) NULL,
        IsActive                     bit not null default(1),
        IsDeleted                    bit NOT NULL Default(0),

        /* ── YOTheme Studio lifecycle columns (1.1.0, blueprint §13) ── */
        BrandKitId                   bigint NULL,
        Thumbnail                    nvarchar(500) NULL,
        PublishedConfig              nvarchar(max) NULL,
        CompiledCss                  nvarchar(max) NULL,
        PublishedCss                 nvarchar(max) NULL,
        ConfigHash                   nvarchar(128) NULL,
        PublishedConfigHash          nvarchar(128) NULL,
        Status                       nvarchar(32) NOT NULL CONSTRAINT DF_YOTheme_Status DEFAULT 'draft',
        IsDefault                    bit NOT NULL CONSTRAINT DF_YOTheme_IsDefault DEFAULT 0,
        IsPublished                  bit NOT NULL CONSTRAINT DF_YOTheme_IsPublished DEFAULT 0,
        PublishedOn                  datetime NULL,
        PublishedBy                  bigint NOT NULL CONSTRAINT DF_YOTheme_PublishedBy DEFAULT 0,
        SchemaVersion                int NOT NULL CONSTRAINT DF_YOTheme_SchemaVersion DEFAULT 1,

        AddedOn                      datetime NOT NULL Default(getdate()),
        AddedBy                      bigint NOT NULL default(0),
        DeletedBy                    bigint NOT NULL default(0),
        DeletedOn                    datetime,
        UpdatedOn                    datetime,
        UpdatedBy                    bigint NOT NULL default(0)
    );

    CREATE INDEX IX_YOTheme_Slug ON dbo.YOTheme(Slug) WHERE IsDeleted = 0;
    CREATE INDEX IX_YOTheme_IsActive ON dbo.YOTheme(IsActive) WHERE IsActive = 1 AND IsDeleted = 0;
    CREATE INDEX IX_YOTheme_Status ON dbo.YOTheme(Status) WHERE IsDeleted = 0;
END
GO

IF OBJECT_ID('dbo.YOThemeOverride', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeOverride
    (
        YOThemeOverrideId            int identity(1,1) primary key,
        YOThemeId                    int NOT NULL references dbo.YOTheme(YOThemeId),
        KeyPath                      nvarchar(500) NOT NULL,
        Value                        nvarchar(MAX) NOT NULL,
        AddedOn                      datetime NOT NULL Default(getdate()),
        AddedBy                      bigint NOT NULL default(0)
    );
    CREATE INDEX IX_YOThemeOverride_ThemeId ON dbo.YOThemeOverride(YOThemeId);
END
GO

IF OBJECT_ID('dbo.YOThemeAsset', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeAsset
    (
        YOThemeAssetId               int identity(1,1) primary key,
        YOThemeId                    int NOT NULL references dbo.YOTheme(YOThemeId),
        AssetPath                    nvarchar(500) NOT NULL,
        AssetType                    nvarchar(50) NOT NULL,
        FileSize                     bigint NOT NULL,
        FileHash                     nvarchar(128) NULL,
        AddedOn                      datetime NOT NULL Default(getdate()),

        /* ── 1.1.0 blueprint §101 extension columns ── */
        BrandKitId                   bigint NULL,
        AssetName                    nvarchar(256) NULL,
        MimeType                     nvarchar(128) NULL,
        AltText                      nvarchar(500) NULL,
        LightVariantAssetId          bigint NULL,
        DarkVariantAssetId           bigint NULL,
        MetadataJson                 nvarchar(max) NULL,
        IsActive                     bit NOT NULL CONSTRAINT DF_YOThemeAsset_IsActive DEFAULT 1,
        IsDeleted                    bit NOT NULL CONSTRAINT DF_YOThemeAsset_IsDeleted DEFAULT 0,
        AddedBy                      bigint NOT NULL CONSTRAINT DF_YOThemeAsset_AddedBy DEFAULT 0,
        UpdatedOn                    datetime NULL,
        UpdatedBy                    bigint NOT NULL CONSTRAINT DF_YOThemeAsset_UpdatedBy DEFAULT 0
    );
    CREATE INDEX IX_YOThemeAsset_ThemeId ON dbo.YOThemeAsset(YOThemeId);
END
GO

/* ── Brand Kit (blueprint §101) ── */
IF OBJECT_ID('dbo.YOBrandKit', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOBrandKit
    (
        BrandKitId           bigint identity(1,1) primary key,
        Name                 nvarchar(256) NOT NULL,
        Description          nvarchar(1000) NULL,
        LogoAssetId          bigint NULL,
        CompactLogoAssetId   bigint NULL,
        DarkLogoAssetId      bigint NULL,
        LightLogoAssetId     bigint NULL,
        FaviconAssetId       bigint NULL,
        PrimaryColor         nvarchar(32) NULL,
        SecondaryColor       nvarchar(32) NULL,
        AccentColor          nvarchar(32) NULL,
        PrimaryFont          nvarchar(256) NULL,
        HeadingFont          nvarchar(256) NULL,
        ConfigurationJson    nvarchar(max) NULL,
        IsActive             bit NOT NULL DEFAULT 1,
        IsDeleted            bit NOT NULL DEFAULT 0,
        AddedOn              datetime NOT NULL DEFAULT getdate(),
        AddedBy              bigint NOT NULL DEFAULT 0,
        UpdatedOn            datetime NULL,
        UpdatedBy            bigint NOT NULL DEFAULT 0
    );
END
GO

/* ── Theme Assignment (blueprint §10) ── */
IF OBJECT_ID('dbo.YOThemeAssignment', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeAssignment
    (
        ThemeAssignmentId    bigint identity(1,1) primary key,
        YOThemeId            int NOT NULL references dbo.YOTheme(YOThemeId),
        TargetType           nvarchar(64) NOT NULL,   -- global | product | application | website | portal | pagegroup | route | feature | campaign
        TargetKey            nvarchar(512) NULL,      -- e.g. public-travel-site, /offers/*
        Priority             int NOT NULL DEFAULT 0,
        ActiveFrom           datetime NULL,
        ActiveTo             datetime NULL,
        IsDefault            bit NOT NULL DEFAULT 0,
        IsActive             bit NOT NULL DEFAULT 1,
        AddedOn              datetime NOT NULL DEFAULT getdate(),
        AddedBy              bigint NOT NULL DEFAULT 0,
        UpdatedOn            datetime NULL,
        UpdatedBy            bigint NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_YOThemeAssignment_Resolve
        ON dbo.YOThemeAssignment (IsActive, TargetType, TargetKey) INCLUDE (YOThemeId, Priority, ActiveFrom, ActiveTo);
    CREATE INDEX IX_YOThemeAssignment_Theme
        ON dbo.YOThemeAssignment (YOThemeId);
END
GO

/* ── Component Registry (blueprint §23) ── */
IF OBJECT_ID('dbo.YOComponentRegistry', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOComponentRegistry
    (
        ComponentRegistryId    bigint identity(1,1) primary key,
        ComponentKey           nvarchar(128) NOT NULL,
        DisplayName            nvarchar(256) NOT NULL,
        Category               nvarchar(128) NULL,
        SupportedVariantsJson  nvarchar(max) NULL,
        SupportedSizesJson     nvarchar(max) NULL,
        SupportedStatesJson    nvarchar(max) NULL,
        SupportedSlotsJson     nvarchar(max) NULL,
        RequiredTokensJson     nvarchar(max) NULL,
        OptionalTokensJson     nvarchar(max) NULL,
        PreviewRenderer        nvarchar(256) NULL,
        FallbackStyleJson      nvarchar(max) NULL,
        Documentation          nvarchar(max) NULL,
        IsActive               bit NOT NULL DEFAULT 1,
        AddedOn                datetime NOT NULL DEFAULT getdate(),
        AddedBy                bigint NOT NULL DEFAULT 0,
        UpdatedOn              datetime NULL,
        UpdatedBy              bigint NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IX_YOComponentRegistry_Key ON dbo.YOComponentRegistry (ComponentKey);
END
GO

/* ── Per-theme component configuration ── */
IF OBJECT_ID('dbo.YOThemeComponent', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeComponent
    (
        ThemeComponentId    bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        ComponentKey        nvarchar(128) NOT NULL,
        ConfigurationJson   nvarchar(max) NULL,
        IsConfigured        bit NOT NULL DEFAULT 0,
        IsActive            bit NOT NULL DEFAULT 1,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0,
        UpdatedOn           datetime NULL,
        UpdatedBy           bigint NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IX_YOThemeComponent_Unique ON dbo.YOThemeComponent (YOThemeId, ComponentKey);
END
GO

/* ── Theme Layout (blueprint §53) ── */
IF OBJECT_ID('dbo.YOThemeLayout', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeLayout
    (
        ThemeLayoutId       bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        Name                nvarchar(256) NOT NULL,
        LayoutType          nvarchar(128) NOT NULL,   -- public-website | application-shell | admin-dashboard | auth | checkout | ...
        ConfigurationJson   nvarchar(max) NULL,
        PreviewImage        nvarchar(500) NULL,
        IsDefault           bit NOT NULL DEFAULT 0,
        IsActive            bit NOT NULL DEFAULT 1,
        IsDeleted           bit NOT NULL DEFAULT 0,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0,
        UpdatedOn           datetime NULL,
        UpdatedBy           bigint NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_YOThemeLayout_Theme ON dbo.YOThemeLayout (YOThemeId, IsDeleted, IsActive);
END
GO

/* ── Theme Template (blueprint §54) ── */
IF OBJECT_ID('dbo.YOThemeTemplate', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeTemplate
    (
        ThemeTemplateId     bigint identity(1,1) primary key,
        YOThemeId           bigint NOT NULL references dbo.YOTheme(YOThemeId),
        ThemeLayoutId       bigint NULL references dbo.YOThemeLayout(ThemeLayoutId),
        Name                nvarchar(256) NOT NULL,
        TemplateType        nvarchar(128) NOT NULL,   -- dashboard | list | form | detail | login | checkout | report | landing | error | ...
        ConfigurationJson   nvarchar(max) NULL,
        PreviewImage        nvarchar(500) NULL,
        IsActive            bit NOT NULL DEFAULT 1,
        IsDeleted           bit NOT NULL DEFAULT 0,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0,
        UpdatedOn           datetime NULL,
        UpdatedBy           bigint NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_YOThemeTemplate_Theme ON dbo.YOThemeTemplate (YOThemeId, IsDeleted, IsActive);
END
GO

/* ── Scoped Section Themes (blueprint §56) ── */
IF OBJECT_ID('dbo.YOThemeScopedStyle', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeScopedStyle
    (
        ScopedStyleId       bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        Name                nvarchar(256) NOT NULL,
        ScopeKey            nvarchar(128) NOT NULL,
        Selector            nvarchar(512) NOT NULL,
        OverrideJson        nvarchar(max) NULL,
        IsActive            bit NOT NULL DEFAULT 1,
        IsDeleted           bit NOT NULL DEFAULT 0,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0,
        UpdatedOn           datetime NULL,
        UpdatedBy           bigint NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IX_YOThemeScopedStyle_Unique ON dbo.YOThemeScopedStyle (YOThemeId, ScopeKey);
END
GO

/* ── Validation results (blueprint §84) ── */
IF OBJECT_ID('dbo.YOThemeValidation', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeValidation
    (
        ThemeValidationId   bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        ValidationType      nvarchar(128) NOT NULL,   -- schema | naming | reference | accessibility | component | css | asset | ...
        Severity            nvarchar(32) NOT NULL,    -- error | warning | info
        Section             nvarchar(128) NULL,
        PropertyPath        nvarchar(512) NULL,
        Message             nvarchar(2000) NOT NULL,
        SuggestedFix        nvarchar(2000) NULL,
        IsResolved          bit NOT NULL DEFAULT 0,
        ValidatedOn         datetime NOT NULL DEFAULT getdate()
    );
    CREATE INDEX IX_YOThemeValidation_Theme ON dbo.YOThemeValidation (YOThemeId, IsResolved, Severity);
END
GO

/* ── Review comments (blueprint §81) ── */
IF OBJECT_ID('dbo.YOThemeComment', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeComment
    (
        ThemeCommentId      bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        Section             nvarchar(128) NULL,
        PropertyPath        nvarchar(512) NULL,
        Comment             nvarchar(max) NOT NULL,
        ParentCommentId     bigint NULL,
        AddedBy             bigint NOT NULL DEFAULT 0,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        IsResolved          bit NOT NULL DEFAULT 0,
        ResolvedBy          bigint NULL,
        ResolvedOn          datetime NULL
    );
    CREATE INDEX IX_YOThemeComment_Theme ON dbo.YOThemeComment (YOThemeId, IsResolved);
END
GO

/* ── Approvals (blueprint §80) ── */
IF OBJECT_ID('dbo.YOThemeApproval', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeApproval
    (
        ThemeApprovalId     bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        ApprovalType        nvarchar(64) NOT NULL,    -- brand | accessibility | technical
        ReviewerId          bigint NOT NULL DEFAULT 0,
        Status              nvarchar(32) NOT NULL DEFAULT 'pending',  -- pending | approved | rejected | changes_requested
        Remarks             nvarchar(2000) NULL,
        ReviewedOn          datetime NULL,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_YOThemeApproval_Theme ON dbo.YOThemeApproval (YOThemeId, Status);
END
GO

/* ── Scheduled activation (blueprint §86) ── */
IF OBJECT_ID('dbo.YOThemeSchedule', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeSchedule
    (
        ThemeScheduleId     bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        ThemeAssignmentId   bigint NULL references dbo.YOThemeAssignment(ThemeAssignmentId),
        StartDate           datetime NOT NULL,
        EndDate             datetime NULL,
        Status              nvarchar(32) NOT NULL DEFAULT 'scheduled',  -- scheduled | active | completed | cancelled
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0
    );
END
GO

/* ── A/B experiments (blueprint §87) ── */
IF OBJECT_ID('dbo.YOThemeExperiment', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeExperiment
    (
        ThemeExperimentId   bigint identity(1,1) primary key,
        Name                nvarchar(256) NOT NULL,
        TargetType          nvarchar(64) NOT NULL,
        TargetKey           nvarchar(512) NULL,
        StartDate           datetime NULL,
        EndDate             datetime NULL,
        Status              nvarchar(32) NOT NULL DEFAULT 'draft',   -- draft | running | stopped | completed
        SuccessMetric       nvarchar(256) NULL,
        ConfigurationJson   nvarchar(max) NULL,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0
    );
END
GO

/* ── Audit log (blueprint §83) ── */
IF OBJECT_ID('dbo.YOThemeAuditLog', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeAuditLog
    (
        ThemeAuditLogId     bigint identity(1,1) primary key,
        YOThemeId           int NULL,                 -- no FK: audit survives theme deletion
        Action              nvarchar(128) NOT NULL,   -- theme.created | theme.edited | token.changed | publication.completed | ...
        Section             nvarchar(128) NULL,
        PropertyPath        nvarchar(512) NULL,
        OldValue            nvarchar(max) NULL,
        NewValue            nvarchar(max) NULL,
        PerformedBy         bigint NOT NULL DEFAULT 0,
        PerformedOn         datetime NOT NULL DEFAULT getdate(),
        IPAddress           nvarchar(64) NULL,
        Remarks             nvarchar(2000) NULL
    );
    CREATE INDEX IX_YOThemeAuditLog_Theme ON dbo.YOThemeAuditLog (YOThemeId, PerformedOn DESC);
END
GO

/* ── Plugin registrations (blueprint §75) ── */
IF OBJECT_ID('dbo.YOThemePlugin', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemePlugin
    (
        ThemePluginId               bigint identity(1,1) primary key,
        PluginKey                   nvarchar(128) NOT NULL,
        Name                        nvarchar(256) NOT NULL,
        Description                 nvarchar(1000) NULL,
        ConfigurationSchema         nvarchar(max) NULL,
        RegisteredComponentsJson    nvarchar(max) NULL,
        RegisteredTokensJson        nvarchar(max) NULL,
        IsEnabled                   bit NOT NULL DEFAULT 1,
        IsActive                    bit NOT NULL DEFAULT 1,
        AddedOn                     datetime NOT NULL DEFAULT getdate(),
        AddedBy                     bigint NOT NULL DEFAULT 0,
        UpdatedOn                   datetime NULL,
        UpdatedBy                   bigint NOT NULL DEFAULT 0
    );
    CREATE UNIQUE INDEX IX_YOThemePlugin_Key ON dbo.YOThemePlugin (PluginKey);
END
GO

/* ── Real-content fixtures (blueprint §60) ── */
IF OBJECT_ID('dbo.YOThemeFixture', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeFixture
    (
        ThemeFixtureId      bigint identity(1,1) primary key,
        ApplicationKey      nvarchar(256) NOT NULL,
        Name                nvarchar(256) NOT NULL,
        Scenario            nvarchar(128) NOT NULL,   -- normal | empty | loading | error | long-content | rtl | ...
        FixtureJson         nvarchar(max) NULL,
        IsActive            bit NOT NULL DEFAULT 1,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0
    );
    CREATE INDEX IX_YOThemeFixture_App ON dbo.YOThemeFixture (ApplicationKey, IsActive);
END
GO

/* ── External integrations (blueprint §74) ── */
IF OBJECT_ID('dbo.YOThemeIntegration', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeIntegration
    (
        ThemeIntegrationId  bigint identity(1,1) primary key,
        YOThemeId           int NOT NULL references dbo.YOTheme(YOThemeId),
        IntegrationType     nvarchar(64) NOT NULL,    -- figma | storybook | ci
        ExternalReference   nvarchar(512) NULL,       -- e.g. figma file key
        ConfigurationJson   nvarchar(max) NULL,
        LastSyncOn          datetime NULL,
        LastSyncStatus      nvarchar(256) NULL,
        IsEnabled           bit NOT NULL DEFAULT 1,
        AddedOn             datetime NOT NULL DEFAULT getdate(),
        AddedBy             bigint NOT NULL DEFAULT 0,
        UpdatedOn           datetime NULL,
        UpdatedBy           bigint NOT NULL DEFAULT 0
    );
END
GO

/* ── Local theme analytics and experiment events (blueprint §94) ── */
IF OBJECT_ID('dbo.YOThemeAnalyticsEvent', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.YOThemeAnalyticsEvent
    (
        ThemeAnalyticsEventId bigint identity(1,1) primary key,
        YOThemeId              int NULL references dbo.YOTheme(YOThemeId),
        ThemeExperimentId      bigint NULL references dbo.YOThemeExperiment(ThemeExperimentId),
        EventType               nvarchar(128) NOT NULL,
        VariantKey             nvarchar(128) NULL,
        TargetType             nvarchar(64) NULL,
        TargetKey              nvarchar(512) NULL,
        EventValue             decimal(18,4) NOT NULL DEFAULT 1,
        OccurredOn             datetime NOT NULL DEFAULT getdate()
    );
    CREATE INDEX IX_YOThemeAnalyticsEvent_Theme ON dbo.YOThemeAnalyticsEvent (YOThemeId, OccurredOn DESC);
    CREATE INDEX IX_YOThemeAnalyticsEvent_Experiment ON dbo.YOThemeAnalyticsEvent (ThemeExperimentId, VariantKey, OccurredOn DESC);
END
GO

/* ============================================================================
   Seed data
   ========================================================================== */

/* ── Component Registry seed (blueprint §23) ── */
MERGE dbo.YOComponentRegistry AS target
USING (VALUES
    ('button',      'Button',       'Actions',    '["primary","secondary","outline","text","soft","gradient","destructive"]', '["small","medium","large"]', '["container","label","leadingIcon","trailingIcon"]', '["button.primary.background","button.primary.text","button.primary.border","button.primary.radius"]', '["button.primary.hoverBackground","button.primary.focusRing"]'),
    ('input',       'Input',        'Forms',      '["default","filled","outline"]', '["small","medium","large"]', '["container","label","control","leadingIcon","trailingIcon","helpText","errorText"]', '["input.background","input.text","input.border","input.focusBorder"]', '["input.placeholder","input.errorBorder"]'),
    ('textarea',    'Textarea',     'Forms',      '["default","filled","outline"]', '["small","medium","large"]', '["container","label","control","helpText","errorText"]', '["input.background","input.text","input.border"]', '["input.focusBorder"]'),
    ('select',      'Select',       'Forms',      '["default","filled","outline"]', '["small","medium","large"]', '["container","label","control","option","helpText","errorText"]', '["input.background","input.text","input.border"]', '["input.focusBorder"]'),
    ('checkbox',    'Checkbox',     'Forms',      '["default"]', '["small","medium","large"]', '["container","control","label"]', '["checkbox.checked.background"]', '["checkbox.border"]'),
    ('radio',       'Radio',        'Forms',      '["default"]', '["small","medium","large"]', '["container","control","label"]', '["radio.checked.background"]', '["radio.border"]'),
    ('switch',      'Switch',       'Forms',      '["default"]', '["small","medium","large"]', '["track","thumb","label"]', '["switch.on.background","switch.off.background"]', '["switch.thumb"]'),
    ('formfield',   'Form Field',   'Forms',      '["default"]', '["small","medium","large"]', '["label","control","helpText","errorText"]', '["formfield.label.color"]', '["formfield.error.color"]'),
    ('card',        'Card',         'Display',    '["default","elevated","outline","interactive"]', '["small","medium","large"]', '["container","header","body","footer","title","description","media","actions"]', '["card.background","card.border","card.radius","card.shadow"]', '["card.headerBackground"]'),
    ('alert',       'Alert',        'Feedback',   '["info","success","warning","error"]', '["medium"]', '["container","icon","title","description","actions"]', '["alert.info.background","alert.info.text"]', '["alert.border"]'),
    ('badge',       'Badge',        'Display',    '["primary","secondary","accent","success","danger","outline"]', '["small","medium","large"]', '["container","label"]', '["badge.primary.background","badge.primary.text"]', '["badge.radius"]'),
    ('table',       'Table',        'Data',       '["default","striped","bordered","compact"]', '["small","medium","large"]', '["container","header","row","cell","footer"]', '["table.headerBackground","table.rowBackground","table.rowHoverBackground","table.border"]', NULL),
    ('pagination',  'Pagination',   'Navigation', '["default","outline","minimal"]', '["small","medium","large"]', '["container","item","activeItem","ellipsis"]', '["pagination.active.background","pagination.active.text"]', NULL),
    ('tabs',        'Tabs',         'Navigation', '["default","pills","underline"]', '["small","medium","large"]', '["list","tab","activeTab","panel"]', '["tabs.active.color","tabs.indicator"]', NULL),
    ('accordion',   'Accordion',    'Navigation', '["default","bordered","separated"]', '["medium"]', '["item","trigger","content","icon"]', '["accordion.border","accordion.trigger.color"]', NULL),
    ('modal',       'Modal',        'Overlay',    '["default","centered","sheet"]', '["small","medium","large","fullscreen"]', '["overlay","container","header","body","footer","closeButton"]', '["modal.background","modal.overlay","modal.radius"]', NULL),
    ('drawer',      'Drawer',       'Overlay',    '["left","right","bottom"]', '["small","medium","large"]', '["overlay","container","header","body","footer"]', '["drawer.background","drawer.overlay"]', NULL),
    ('tooltip',     'Tooltip',      'Overlay',    '["default"]', '["small","medium"]', '["container","arrow"]', '["tooltip.background","tooltip.text"]', NULL),
    ('dropdown',    'Dropdown',     'Overlay',    '["default"]', '["small","medium","large"]', '["trigger","menu","item","separator"]', '["dropdown.background","dropdown.itemHover"]', NULL),
    ('breadcrumb',  'Breadcrumb',   'Navigation', '["default"]', '["small","medium"]', '["list","item","separator","currentItem"]', '["breadcrumb.color","breadcrumb.currentColor"]', NULL),
    ('navigation',  'Navigation',   'Layout',     '["horizontal","vertical","mega"]', '["medium"]', '["container","brand","item","activeItem","actions"]', '["navigation.background","navigation.itemColor","navigation.activeColor"]', NULL),
    ('sidebar',     'Sidebar',      'Layout',     '["expanded","collapsed","overlay"]', '["medium"]', '["container","section","item","activeItem","footer"]', '["sidebar.background","sidebar.itemColor","sidebar.activeBackground"]', NULL),
    ('header',      'Header',       'Layout',     '["default","sticky","transparent"]', '["medium"]', '["container","brand","navigation","actions"]', '["header.background","header.border"]', NULL),
    ('footer',      'Footer',       'Layout',     '["default","compact","mega"]', '["medium"]', '["container","column","link","bottom"]', '["footer.background","footer.linkColor"]', NULL),
    ('avatar',      'Avatar',       'Display',    '["circle","square","rounded"]', '["small","medium","large"]', '["container","image","fallback","status"]', '["avatar.background","avatar.text"]', NULL),
    ('progress',    'Progress',     'Feedback',   '["default","striped","animated"]', '["small","medium","large"]', '["track","bar","label"]', '["progress.track","progress.bar"]', NULL),
    ('skeleton',    'Skeleton',     'Feedback',   '["default"]', '["small","medium","large"]', '["container"]', '["skeleton.background","skeleton.highlight"]', NULL),
    ('emptystate',  'Empty State',  'Feedback',   '["default"]', '["medium"]', '["container","icon","title","description","actions"]', '["emptystate.iconColor","emptystate.textColor"]', NULL),
    ('toast',       'Toast',        'Feedback',   '["default","success","info","warning","error"]', '["medium"]', '["container","icon","title","description","action"]', '["toast.background","toast.text"]', NULL)
) AS source (ComponentKey, DisplayName, Category, Variants, Sizes, Slots, RequiredTokens, OptionalTokens)
ON target.ComponentKey = source.ComponentKey
WHEN NOT MATCHED THEN
    INSERT (ComponentKey, DisplayName, Category, SupportedVariantsJson, SupportedSizesJson, SupportedStatesJson, SupportedSlotsJson, RequiredTokensJson, OptionalTokensJson, IsActive)
    VALUES (source.ComponentKey, source.DisplayName, source.Category, source.Variants, source.Sizes,
            '["default","hover","focus","active","disabled","loading","selected","error","success"]',
            source.Slots, source.RequiredTokens, source.OptionalTokens, 1);
GO

/* ── Default theme seed (was 1.0.0 install YOTheme seed; now canonical here) ── */
IF NOT EXISTS (SELECT 1 FROM dbo.YOTheme WHERE YOThemeUniqueId = 'YO-DEFAULT-THEME' AND IsDeleted = 0)
BEGIN
    INSERT INTO dbo.YOTheme (
        YOThemeUniqueId, Name, Slug, [Version], Author,
        Description, Tags, Config, IsActive, IsSystem, AddedBy
    ) VALUES (
        'YO-DEFAULT-THEME',
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