CREATE TABLE dbo.AppUser
(		
	AppUserId												bigint primary key identity(1,1),
	IdentityUserId											bigint not null,
	FirstName												nvarchar(256) ,
    LastName												nvarchar(256),
    Bio														nvarchar(2000),
    Email													nvarchar(256) not null,
    Address													nvarchar(256)  null,      
    PhoneNumber												nvarchar(256)  null,        
    DOB														nvarchar(256)  null,
    ProfilePicture											nvarchar(256)  null,
	Gender													nvarchar(10) null, -- m:male, f:female, o:other	
	UserName							    				nvarchar(256) not null,		
	Designation												nvarchar(256),
	FacebookLink											nvarchar(256),
	LinkedInLink											nvarchar(256),
	TweeterLink												nvarchar(256),
	InstagramLink											nvarchar(256),		
	CoverImage												nvarchar(256),			
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
create TABLE dbo.IdentityRole
(
	Id 														bigint primary key IDENTITY(1,1) NOT NULL,
	ConcurrencyStamp										nvarchar(max) NULL,
	Name													nvarchar(256) NULL,
	NormalizedName											nvarchar(256) NULL,
	IsTemporary												bit NOT NULL Default(0),
	IsSystem												bit default(0) not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
CREATE TABLE dbo.TemporaryRoleDetail
(
	Id 														bigint primary key IDENTITY(1,1) NOT NULL,
	RoleId													bigint NOT NULL default(0),
	StartDate												datetime not null Default(getDATE()),
	EndDate													datetime not null Default(getDATE()),
	Narration												nvarchar(max)
);
CREATE TABLE dbo.IdentityRoleClaim
(
	Id														int primary key IDENTITY(1,1) NOT NULL,
	ClaimType												nvarchar(max) NULL,
	ClaimValue												nvarchar(max) NULL,
	RoleId													bigint references dbo.IdentityRole NOT NULL
);
CREATE TABLE dbo.IdentityUser
(
	Id														bigint primary key identity(1,1) NOT NULL,
	AccessFailedCount										int NOT NULL,
	ConcurrencyStamp										nvarchar(max) NULL,
	Email													nvarchar(256) NULL,
	EmailConfirmed											bit NOT NULL,
	LockoutEnabled											bit NOT NULL,
	LockoutEnd												datetimeoffset(7) NULL,
	NormalizedEmail											nvarchar(256) NULL,
	NormalizedUserName										nvarchar(256) NULL,
	PasswordHash											nvarchar(max) NULL,
	PhoneNumber												nvarchar(max) NULL,
	PhoneNumberConfirmed									bit NOT NULL,
	SecurityStamp											nvarchar(max) NULL,
	TwoFactorEnabled										bit NOT NULL,
	UserName												nvarchar(256) NULL
);

CREATE TABLE dbo.IdentityUserClaim
(
	Id 														bigint  primary key IDENTITY(1,1) NOT NULL,
	ClaimType												nvarchar(max) NULL,
	ClaimValue												nvarchar(max) NULL,
	UserId													bigint  NOT NULL references dbo.IdentityUser
 );

CREATE TABLE dbo.IdentityUserLogin
(
	LoginProvider											nvarchar(450) NOT NULL,
	ProviderKey												nvarchar(450) NOT NULL,
	ProviderDisplayName										nvarchar(max) NULL,
	UserId													bigint  NOT NULL references dbo.IdentityUser
);	

CREATE TABLE dbo.IdentityUserRole
(
	UserId													bigint NOT NULL references dbo.IdentityUser,
	RoleId													bigint NOT NULL references dbo.IdentityRole
);

CREATE CLUSTERED INDEX idx_usr_lgn
	ON dbo.IdentityUserRole(UserId, RoleId);

CREATE TABLE dbo.IdentityUserToken
(
	UserId													bigint NOT NULL references dbo.IdentityUser,
	LoginProvider											nvarchar(450) NOT NULL,
	Name													nvarchar(450) NOT NULL,
	Value													nvarchar(max) NULL
);
create table dbo.RTCUser
(
	RTCUserId												int primary key not null identity(1,1),
	IdentityUserId											bigint not null default(0),
	SessionId												nvarchar(500) default(''),
	GroupName												nvarchar(256) default(''),
	UserRoles												nvarchar(1000) default(''),
	IsFromWeb												bit default(0),
	IsFromMobile											bit default(0),
	UserDevice												nvarchar(2000) default(''),
	ConnectionId											nvarchar(500) not null,
	HubName													nvarchar(256) not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)

);

CREATE TABLE dbo.Country(
	CountryId 												int identity(1,1) primary key not null,
	ISO 													nvarchar(2) not null,
	Name 													nvarchar(80) not null,
	NiceName 												nvarchar(80) default(''),
	LocaleName 												ntext default('') ,
	ISO3 													nvarchar(3) default(''),
	Numcode 												smallint default(0),
	PhoneCode 												int default(0),
	CurrencySymbol 											ntext default('') ,
	CurrencyCode 											nvarchar(3) default(''),
	Currency 												nvarchar(256)default('') 
);

CREATE Table dbo.LocaleRegion
(
	LocaleRegionId											int primary key identity(1,1) not null,
	CountryId                           					int not null default(0),
	Flag													nvarchar(256),
	Culture													varchar(10),
	IsDefault 												bit NOT NULL Default(0),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE TABLE dbo.LocaleResource 
(
    LocaleResourceId										int primary key identity(1,1) not null,
    Culture													varchar (10)    not null,
    Name													varchar (100)   not null,
    Value													nvarchar (4000) not null,
    GroupName												nvarchar(256)
);

CREATE INDEX idx_localization
	ON dbo.LocaleResource (Culture, GroupName);

CREATE TABLE dbo.Module
(
	ModuleId												int primary key identity(1,1) not null,
	Name													nvarchar(256) not null,
	DisplayName												nvarchar(256),
	ModuleKey												nvarchar(256),
	Description												nvarchar(max) ,
	Version													nvarchar(256) not null,
	ActiveVersion											nvarchar(64),
	StagedVersion											nvarchar(64),
	LifecycleState											nvarchar(64),
	RuntimeState											nvarchar(64),
	PackageHash												nvarchar(128),
	PackagePath												nvarchar(1024),
	StagingPath												nvarchar(1024),
	ManifestJson											nvarchar(max),
	LastOperation											nvarchar(64),
	LastError												nvarchar(max),
	IsInstalled												bit default(0) not null,
	Author													nvarchar(256),
	IsRestartRequired										bit default(0) not null,
	EnabledOn												datetime,
	DisabledOn												datetime,
	IsBuiltIn												bit default(0) not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)

);

CREATE INDEX IX_Module_ModuleKey
	ON dbo.Module (ModuleKey);

CREATE TABLE dbo.ModuleOperationJournal
(
	ModuleOperationJournalId								bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64),
	OperationType											nvarchar(64) not null,
	OperationStatus											nvarchar(64) not null,
	LifecycleState											nvarchar(64) not null,
	RuntimeState											nvarchar(64) not null,
	Message													nvarchar(max),
	PayloadJson												nvarchar(max),
	ErrorJson												nvarchar(max),
	StartedOn												datetime not null default(getutcdate()),
	CompletedOn												datetime,
	RequestedBy												bigint not null default(0)
);

CREATE INDEX IX_ModuleOperationJournal_ModuleName
	ON dbo.ModuleOperationJournal (ModuleName, StartedOn DESC);

CREATE TABLE dbo.ModuleMigrationHistory
(
	ModuleMigrationHistoryId								bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64) not null,
	MigrationName											nvarchar(256) not null,
	MigrationType											nvarchar(64) not null,
	ScriptPath												nvarchar(1024) not null,
	ScriptHash												nvarchar(128) not null,
	Succeeded												bit not null default(0),
	ErrorMessage											nvarchar(max),
	AppliedOn												datetime not null default(getutcdate()),
	AppliedBy												bigint not null default(0)
);

CREATE UNIQUE INDEX IX_ModuleMigrationHistory_Unique
	ON dbo.ModuleMigrationHistory (ModuleName, ModuleVersion, ScriptHash);

CREATE TABLE dbo.ModuleVersion
(
	ModuleVersionId											bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	Version													nvarchar(64) not null,
	VersionPath												nvarchar(1024) not null,
	PackageHash												nvarchar(128),
	ManifestJson											nvarchar(max),
	ValidationStatus										nvarchar(64) not null,
	LifecycleState											nvarchar(64) not null,
	IsActive												bit not null default(0),
	IsRollbackEligible										bit not null default(1),
	InstalledOn												datetime,
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE UNIQUE INDEX IX_ModuleVersion_Unique
	ON dbo.ModuleVersion (ModuleName, Version);

CREATE TABLE dbo.ModuleDependency
(
	ModuleDependencyId										bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64) not null,
	DependencyModuleName									nvarchar(256) not null,
	MinimumVersion											nvarchar(64),
	MaximumVersion											nvarchar(64),
	IsRequired												bit not null default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE INDEX IX_ModuleDependency_Module
	ON dbo.ModuleDependency (ModuleName, ModuleVersion);

CREATE TABLE dbo.ModulePermission
(
	ModulePermissionId										bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64) not null,
	PermissionKey											nvarchar(256) not null,
	IsActive												bit not null default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE UNIQUE INDEX IX_ModulePermission_Unique
	ON dbo.ModulePermission (ModuleName, ModuleVersion, PermissionKey);

CREATE TABLE dbo.ModuleMenu
(
	ModuleMenuId											bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64) not null,
	MenuKey													nvarchar(256) not null,
	Title													nvarchar(256) not null,
	Url														nvarchar(512) not null,
	Icon													nvarchar(256),
	ParentKey												nvarchar(256),
	MenuOrder												int not null default(0),
	MenuGroupId												int not null default(1),
	IsBackend												bit not null default(1),	
	MenuId													int,
	IsActive												bit not null default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE UNIQUE INDEX IX_ModuleMenu_Unique
	ON dbo.ModuleMenu (ModuleName, ModuleVersion, MenuKey);

CREATE TABLE dbo.ModuleSetting
(
	ModuleSettingId											bigint primary key identity(1,1) not null,
	ModuleName												nvarchar(256) not null,
	ModuleVersion											nvarchar(64) not null,
	SettingKey												nvarchar(256) not null,
	Name													nvarchar(256) not null,
	DataType												nvarchar(64),
	DefaultValue											nvarchar(max),
	IsRequired												bit not null default(0),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE UNIQUE INDEX IX_ModuleSetting_Unique
	ON dbo.ModuleSetting (ModuleName, ModuleVersion, SettingKey);

CREATE TABLE dbo.YOTheme
(
	YOThemeId               								int identity(1,1) primary key,
	YOThemeUniqueId         								nvarchar(256) NOT NULL,
	Name                    								nvarchar(256) NOT NULL,
	Slug                    								nvarchar(256) NOT NULL,
	[Version]               								nvarchar(20) NOT NULL,
	Author                  								nvarchar(256) NULL,
	Description             								NVARCHAR(1000) NULL,
	Tags                    								nvarchar(500) NULL,
	Screenshot              								nvarchar(500) NULL,
	Config                  								nvarchar(max) NULL,	
	IsSystem                								bit NOT NULL DEFAULT 0,
	ParentYOThemeId         								int NULL,
	PackagePath             								nvarchar(1024) NULL,
	PackageHash             								nvarchar(128) NULL,
	IsActive												bit not null default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getdate()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);


CREATE INDEX IX_YOTheme_Slug ON dbo.YOTheme(Slug) WHERE IsDeleted = 0;
CREATE INDEX IX_YOTheme_IsActive ON dbo.YOTheme(IsActive) WHERE IsActive = 1 AND IsDeleted = 0;



CREATE TABLE dbo.YOThemeOverride
(
	YOThemeOverrideId       								int identity(1,1) primary key,
	YOThemeId               								int NOT NULL references dbo.YOTheme(YOThemeId),
	KeyPath                 								nvarchar(500) NOT NULL,
	Value                   								nvarchar(MAX) NOT NULL,
	AddedOn                                 				datetime NOT NULL Default(getdate()),
	AddedBy                                 				bigint not null default(0),
);
CREATE INDEX IX_YOThemeOverride_ThemeId ON dbo.YOThemeOverride(YOThemeId);


CREATE TABLE dbo.YOThemeAsset
(
	YOThemeAssetId          								int identity(1,1) primary key,
	YOThemeId               								int NOT NULL references dbo.YOTheme(YOThemeId),
	AssetPath               								nvarchar(500) NOT NULL,
	AssetType               								nvarchar(50) NOT NULL,
	FileSize                								bigint NOT NULL,
	FileHash                								nvarchar(128) NULL,
	AddedOn                 								datetime NOT NULL Default(getdate())
);
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

CREATE INDEX IX_YOThemeAsset_ThemeId ON dbo.YOThemeAsset(YOThemeId);

CREATE TABLE dbo.MasterLayout
(
	MasterLayoutId											int primary key identity(1,1) not null,
	MasterLayoutUniqueId									nvarchar(128) not null,
	YOThemeId 												int NULL REFERENCES dbo.YOTheme(YOThemeId),
	Name													nvarchar(256) not null,
	Description												nvarchar(max),
	HasHeader												bit not null default(1),
	HasFooter												bit not null default(1),
	Sidebar													nvarchar(20) not null default('none'),
	IsSystem												bit not null default(0),
	LayoutConfig											nvarchar(max),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE INDEX IX_MasterLayout_MasterLayoutUniqueId
	ON dbo.MasterLayout (MasterLayoutUniqueId);

CREATE INDEX IX_MasterLayout_IsSystem
	ON dbo.MasterLayout (IsSystem, IsActive, IsDeleted);

CREATE NONCLUSTERED INDEX IX_MasterLayout_List_Covering
	ON dbo.MasterLayout (IsDeleted, IsActive, IsSystem DESC, Name ASC)
	INCLUDE (MasterLayoutUniqueId, Description, HasHeader, HasFooter, Sidebar, AddedOn, UpdatedOn);

INSERT INTO dbo.MasterLayout
(
	MasterLayoutUniqueId,
	Name,
	Description,
	HasHeader,
	HasFooter,
	Sidebar,
	IsSystem,
	LayoutConfig
)
VALUES
	('none', 'Standalone / No Master', 'Only page content is rendered.', 0, 0, 'none', 1, NULL),
	('default-site', 'Default Website', 'Editable header and footer around page content.', 1, 1, 'none', 1, NULL),
	('landing', 'Landing Page', 'Minimal campaign layout with compact nav.', 1, 1, 'none', 1, NULL),
	('docs-left-sidebar', 'Docs Left Sidebar', 'Header, footer, and editable left sidebar shell.', 1, 1, 'left', 1, NULL);

CREATE TABLE dbo.Page
(
	PageId													int primary key identity(1,1) not null,
	PageUniqueId											nvarchar(128),
	YOThemeId 												int NULL REFERENCES dbo.YOTheme(YOThemeId),
	MasterLayoutId											nvarchar(128),
	Name													nvarchar(256) NOT NULL,
	URL														nvarchar(256),
	Slug													nvarchar(512),
	PageType												nvarchar(20) not null default('legacy'),
	Status													nvarchar(20),	
	Version													int not null default(1),
	PublishedAt												datetime,
	Content													nvarchar(max) NULL,
	ContentConfig											nvarchar(max) null,
	ContentConfigDraft										nvarchar(max),
	UseMasterLayout											bit default(0) not null,
	TemplateType 											NVARCHAR(100) NOT NULL DEFAULT 'page',
	ThemeOverrideJson 										NVARCHAR(MAX),
	IsPublished												bit default(0) not null,
	IsBackend												bit default(0) not null,
	Culture													nvarchar(10) not null,
	LastModified											datetime NOT NULL,
	LastRequested											datetime NULL,
	ModuleId												int not null default(0),
	IsSystem												bit default(1),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE INDEX IX_Page_PageUniqueId
	ON dbo.Page (PageUniqueId)
	WHERE PageUniqueId IS NOT NULL;

CREATE INDEX IX_Page_PageType
	ON dbo.Page (PageType, IsActive, IsDeleted);

CREATE INDEX IX_Page_Slug
	ON dbo.Page (Slug)
	WHERE Slug IS NOT NULL;

CREATE INDEX IX_Page_Status
	ON dbo.Page (Status, IsActive, IsDeleted)
	WHERE Status IS NOT NULL;


CREATE TABLE dbo.Plugin
(
	PluginId												int primary key identity(1,1) not null,
	PluginType												int not null,
	Name													nvarchar(256) not null,
	SystemName												nvarchar(256) not null,
	Image													nvarchar(256) ,
	Version													nvarchar(256) not null,
	Author													nvarchar(256) not null,
	Description												nvarchar(max),
	IsInstalled												bit default(0),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

Create Table dbo.MenuGroup
(
	MenuGroupId												int primary key identity(1,1) not null,
	Name													nvarchar(256) not null,
	Description												nvarchar(max) ,	
	IsSystem												bit not null default(0),
    IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

Create Table dbo.Menu
(
	MenuId													int primary key identity(1,1) not null,
	Name													nvarchar(256) not null,
	SubTitle												nvarchar(256),
	Url														nvarchar(256) not null,
	Icon													nvarchar(256),
	CssClass												nvarchar(256),
	IsChild													bit default(0) not null,
	ParentId												int default(0) not null,
	MenuOrder												int default(0) not null,
	MenuGroupId												int not null default(0),--main,side side2
	Culture													nvarchar (10)  not null,
	IsBackend												bit default(0) not null,
	IsSystem												bit default(0) not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

Create table dbo.MenuPermission
(
	MenuPermissionId										int primary key identity(1,1) not null,
	MenuId													int not null default(0),
	AllowAccessForAll										bit default(0) not null,
	AllowAccess												bit default(0) not null,
	RoleId													bigint not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
Create Table dbo.MenuSetting
(	
	MenuSettingId											int primary key identity(1,1) not null,
	MenuGroupName											nvarchar(256) not null,
	MenuGroupId												int references dbo.MenuGroup,
	ShowMenuAs												nvarchar(256) not null,--sidebar footer footer2,main navigation 
	CssClasses												nvarchar(256)

);

CREATE TABLE dbo.SEO
(
	SEOId													int primary key IDENTITY(1,1),
	MetaTitle												nvarchar(256)  null,
	MetaKeyWords											nvarchar(256)  null,
	MetaDescription											nvarchar(max) null,
	SeoType													nvarchar(256) not null,--page,product..
	LastUrl													nvarchar(256) null,
	Url														nvarchar(256) not null,
	Image													nvarchar(256) ,
	PageName												nvarchar(256) null,
	PageId								 					int default(0),
	ProductId												int null default(0),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)

);

CREATE table dbo.Setting
(
	SettingId												int primary key identity(1,1) not null,
	WebsiteName												nvarchar(256) not null,
	Description												nvarchar(500),
	CountryId												int default(0) ,	
	Address1												nvarchar(256),
	Address2												nvarchar(256),
	PhoneNumber												nvarchar(256),
	Email													nvarchar(256), 	
	State 													nvarchar(256),
	City													nvarchar(256),
	TimeZoneId												int default(0),
	Longitude												decimal(16,4) default(0),
	Lattitude												decimal(16,4) default(0),	
	Logo													nvarchar(256) not null,
	BaseCulture 											nvarchar(10) not null,
	BaseCurrency											nvarchar(5) not null,		
	CurrencyCode											nvarchar(5) not null,
	GoogleAnalyticScript 									nvarchar(1000) null,
	UseHttps												bit default(0) NOT NULL,
	DefaultEmail											nvarchar(256),
	SupportEmail											nvarchar(256),
	SalesEmail												nvarchar(256),
	MarketingEmail											nvarchar(256)

);
Create table dbo.AuditLog
(
	AuditId													bigint primary key identity(1,1) not null,
	Url														nvarchar(500),
	Action													nvarchar(500),
	Duration												int not null default(0),
	UserName												nvarchar(500),
	Role 													nvarchar(500),
	IpAddress												nvarchar(500),
	UserAgent												nvarchar(1000),
	RequestObject											nvarchar(max),
	AddedOn													datetime default(getdate())
);

CREATE TABLE dbo.Sessions
(  
    Id														nvarchar(449)  PRIMARY KEY NOT NULL,  
    Value													varbinary(max) NOT NULL,  
    ExpiresAtTime											datetimeoffset(7) NOT NULL,  
    SlidingExpirationInSeconds								bigint NULL,  
    AbsoluteExpiration										datetimeoffset(7) NULL
);

CREATE NONCLUSTERED INDEX Index_ExpiresAtTime ON dbo.Sessions  
(  
    ExpiresAtTime ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  

CREATE TABLE dbo.SMSGateway
( 
	SMSGatewayId											int primary key identity(1,1) not null,
	Name													nvarchar(256) not null,
	Description												nvarchar(1000),
	Image													nvarchar(256),
	IsDefault												bit default(0) not null,
    IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);
CREATE TABLE dbo.SMSGatewaySetting
( 
   SMSGatewaySettingId										int primary key identity(1,1) not null,
   SMSGatewayId												int not null,
   GatewayKey												nvarchar(256) not null,
   GatewayValue												nvarchar(256) not null

);
Create Table dbo.SMSLog
(
	SMSLogId												bigint primary key identity(1,1) not null,
	[From]													nvarchar(256),
	[To]													nvarchar(256),	
	Body													nvarchar(max),	
	IsSent													bit default(0),
	IsDelivered												bit default(0),
	SentDate												datetime default(getutcdate()),
	DeliveredDate											datetime not null,
	GatewayResponse											nvarchar(1000),
	AddedOn													datetime default(getutcdate()),
	AddedBy													nvarchar(256) not null
);

CREATE TABLE dbo.EmailServiceProvider
( 
	EmailServiceProviderId									int primary key identity(1,1) not null,
	Name													nvarchar(256) not null,
	Description												nvarchar(1000),
	Image													nvarchar(256),
	IsDefault												bit default(0) not null,
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);

CREATE TABLE dbo.EmailServiceProviderSetting
( 
   EmailServiceProviderSettingId							int primary key identity(1,1) not null,
   EmailServiceProviderId									int not null,
   ProviderKey												nvarchar(256) not null,
   ProviderValue											nvarchar(256) not null

);
Create Table dbo.EmailLog
(
	EmailLogId												bigint primary key identity(1,1) not null,
	[From]													nvarchar(256),
	[To]													nvarchar(256),
	Subject													nvarchar(500),
	Body													nvarchar(max),
	CC														nvarchar(2000),
	BCC														nvarchar(2000),
	IsSent													bit default(0),
	IsDelivered												bit default(0),
	SentDate												datetime default(getutcdate()),
	DeliveredDate											datetime not null,
	GatewayResponse											nvarchar(1000),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)
);

Create Table dbo.RestrictionKey
(
	RestrictionKeyId										int primary key identity(1,1) not null,	 
	Name													nvarchar(256) not null,
	IsSystem												bit default(0) not null,
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
	 
);
Create table dbo.Restriction
(
	RestrictionId											int primary key identity(1,1) not null,
	RestrictionKeyId										int references dbo.RestrictionKey,
	Value													nvarchar(256) not null,
	Reason													nvarchar(500) not null,
	Narration												nvarchar(500),
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
create table dbo.AdministrativeIPAccess
(
	AdministrativeIPAccessId								int primary key identity(1,1) not null,
	RoleId													bigint not null,
	AllowIPV4												nvarchar(256) not null,--*
	AllowIPV6												nvarchar(500) not null, --*
	ActivateIPV6											bit default(0) not null,--if true check only ipv6 if not ipv4
	IsRange													bit default(0) not null,
	IPV4Range												nvarchar(500),--192.168.0.1-192.168.0.254
	IPV6Range												nvarchar(1000),--FE80:0:0:0:202:B3FF:FE1E:8329-FE80:0:0:0:202:B3FF:FE1E:8329	
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)
);

CREATE TABLE dbo.UserSecretKey
(
	UserSecretKeyId											bigint not null primary key identity(1,1),
	UserId													bigint not null default(0),
	SecretKey												nvarchar(500) not null,
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)
);

CREATE TABLE dbo.OTPSetting
(
	OTPSettingId											bigint not null primary key identity(1,1),
	ExpiryTime												int not null default(60),--in seconds
	SendFromSms												bit default(1) not null,
	SendFromEmail											bit default(1) not null,
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);

CREATE TABLE dbo.UserOTP
(
	UserOTPId												bigint not null primary key identity(1,1),
	UserId													bigint not null default(0),
	OTPCode													nvarchar(500) not null,
	IsExpired												bit default(0) not null
);

CREATE TABLE dbo.UnSubscription 
(
	UnSubscriptionId										int not null primary key identity(1,1),
	Email													nvarchar(256) not null,
	Newsletter												bit NOT NULL DEFAULT (0),
	Promotional												bit NOT NULL DEFAULT (0),
	Informative												bit NOT NULL DEFAULT (0),
	Transactional											bit NOT NULL DEFAULT (0),
	AllEmail												bit NOT NULL DEFAULT (0),
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)
 
);


CREATE TABLE dbo.EmailTemplate
(
	TemplateId												int primary key IDENTITY(1,1),
	TemplateName											nvarchar(100),
	TemplateType											varchar(100),
	Template												ntext,
	EmailSubject											nvarchar(1000),
	HeaderTemplate 											ntext,
	FooterTemplate 											ntext,
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);
CREATE TABLE dbo.UserDevice
(
	UserDeviceId 											bigint not null primary key identity(1,1),
	UserId													bigint not null,
	DeviceId												nvarchar(500) not null,
	IsWeb													bit default(0),
	IsMobile    											bit default(0),	
	Browser	        										nvarchar(256),
	BrowserVersion											nvarchar(50),
	OS														nvarchar(256),
	Version													nvarchar(50),
	IsVerified												bit default(0),
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);

CREATE TABLE dbo.UserFCMDevice
(
	UserFCMDeviceId 										bigint not null primary key identity(1,1),
	UserId													bigint not null,
	DeviceId												nvarchar(500) not null,	
	GroupName												nvarchar(256),
	OS														nvarchar(256),
	Version													nvarchar(50),	
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)

);
CREATE TABLE dbo.UserLoginHistory
(
	UserLoginHistoryId  									bigint not null primary key identity(1,1),
	UserId 													bigint NOT NULL,
	IpAddress 												nvarchar(256) NULL,
	LastLogin 												datetime NULL,
	IsFromWeb 												bit NULL,
	IsFromMobile 											bit NULL,
	UserDevice 												nvarchar(2000) NULL,
	Browser 												nvarchar(256) NULL,
	Device 													nvarchar(256) NULL,
	IsActive												bit NOT NULL Default(1),
	IsDeleted												bit NOT NULL Default(0),
	AddedOn													datetime NOT NULL Default(getDATE()),
	AddedBy													bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn												datetime,
	UpdatedOn												datetime ,
	UpdatedBy												bigint not null default(0)
);

CREATE TABLE dbo.ApplicationController
(
	ApplicationControllerId									int not null primary key identity(1,1),
	Name													nvarchar(500) not null

);
CREATE TABLE dbo.ApplicationControllerAction
(
	ApplicationControllerActionId							int not null primary key identity(1,1),
	ApplicationControllerId									int not null default(0),
	ActionUrl												nvarchar(500),
	RouteUrl												nvarchar(500),
	FriendlyName											nvarchar(500)

);

CREATE TABLE dbo.MasterRolePermission
(
	MasterRolePermissionId									bigint primary key identity(1,1) not null,
	ApplicationControllerActionId							int not null default(0),
	ApplicationControllerId									int not null default(0),
	RoleId													bigint not null,	
	AllowAccess												bit default(0) not null,										
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);

CREATE TABLE dbo.UserPermission
(
	UserPermissionId										bigint primary key identity(1,1) not null,
	ApplicationControllerActionId							int not null default(0),
	ApplicationControllerId									int not null default(0),	
	AllowAccess												bit default(0) not null,		
	UserId													bigint not null,								
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy												bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
CREATE TABLE dbo.OpenIddictApplications
(
    Id                                                  	nvarchar(450) primary key not null,
    ApplicationType                                     	nvarchar(50) null,
    ClientId                                            	nvarchar(100) null,
    ClientSecret                                        	nvarchar(max) null,
    ClientType                                          	nvarchar(50) null,
    ConcurrencyToken                                    	nvarchar(50) null,
    ConsentType                                         	nvarchar(50) null,
    DisplayName                                         	nvarchar(max) null,
    DisplayNames                                        	nvarchar(max) null,
    JsonWebKeySet                                       	nvarchar(max) null,
    Permissions                                         	nvarchar(max) null,
    PostLogoutRedirectUris                              	nvarchar(max) null,
    Properties                                          	nvarchar(max) null,
    RedirectUris                                        	nvarchar(max) null,
    Requirements                                        	nvarchar(max) null,
    Settings                                            	nvarchar(max) null
);

CREATE TABLE dbo.OpenIddictAuthorizations
(
    Id                                                  	nvarchar(450) primary key not null,
    ApplicationId                                       	nvarchar(450) null references dbo.OpenIddictApplications(Id),
    ConcurrencyToken                                    	nvarchar(50) null,
    CreationDate                                        	datetime2(7) null,
    Properties                                          	nvarchar(max) null,
    Scopes                                              	nvarchar(max) null,
    Status                                              	nvarchar(50) null,
    Subject                                             	nvarchar(400) null,
    Type                                                	nvarchar(50) null
);

CREATE TABLE dbo.OpenIddictScopes
(
    Id                                                  	nvarchar(450) primary key not null,
    ConcurrencyToken                                    	nvarchar(50) null,
    Description                                         	nvarchar(max) null,
    Descriptions                                        	nvarchar(max) null,
    DisplayName                                         	nvarchar(max) null,
    DisplayNames                                        	nvarchar(max) null,
    Name                                                	nvarchar(200) null,
    Properties                                          	nvarchar(max) null,
    Resources                                           	nvarchar(max) null
);

CREATE TABLE dbo.OpenIddictTokens
(
    Id                                                  	nvarchar(450) primary key not null,
    ApplicationId                                       	nvarchar(450) null references dbo.OpenIddictApplications(Id),
    AuthorizationId                                     	nvarchar(450) null references dbo.OpenIddictAuthorizations(Id),
    ConcurrencyToken                                    	nvarchar(50) null,
    CreationDate                                        	datetime2(7) null,
    ExpirationDate                                      	datetime2(7) null,
    Payload                                             	nvarchar(max) null,
    Properties                                          	nvarchar(max) null,
    RedemptionDate                                      	datetime2(7) null,
    ReferenceId                                         	nvarchar(100) null,
    Status                                              	nvarchar(50) null,
    Subject                                             	nvarchar(400) null,
    Type                                                	nvarchar(500) null
);

CREATE TABLE dbo.HtmlComponent
(
	HtmlComponentId								        	int primary key identity(1,1) not null,
	Name									            	nvarchar(256) not null,
  	DisplayName                             				nvarchar(256) not null,
  	ShortDescription                        				nvarchar(500),
  	Icon                                    				nvarchar(50),
  	PreviewImage                            				nvarchar(500),
  	Config                                  				nvarchar(max),
  	ContentStructure                        				nvarchar(max),
  	HtmlTemplate                            				nvarchar(max),		
	StateSchema 											NVARCHAR(MAX) NULL,
    ApiBindings 											NVARCHAR(MAX) NULL,
    EventBindings 											NVARCHAR(MAX) NULL,
    RuntimeOptions 											NVARCHAR(MAX) NULL,
    Version 												NVARCHAR(50) NULL,					
	IsActive                                				bit NOT NULL Default(1),
	IsDeleted                               				bit NOT NULL Default(0),
	AddedOn                                 				datetime NOT NULL Default(getDATE()),
	AddedBy                                 				bigint not null default(0),
	DeletedBy								            	bigint not null default(0),
	DeletedOn                               				datetime,
	UpdatedOn                               				datetime ,
	UpdatedBy                               				bigint not null default(0)
);
CREATE TABLE dbo.Timezone
(
    Id                                                  	int identity(1,1) primary key not null,
    Identifier                                          	nvarchar(100) null,
    StandardName                                        	nvarchar(100) null,
    DisplayName                                         	nvarchar(100) null,
    DaylightName                                        	nvarchar(100) null,
    SupportsDaylightSavingTime                          	bit null,
    BaseUtcOffsetSec                                    	int null,
    UTC                                                 	nvarchar(15) null
);

CREATE TABLE dbo.TimezoneAdjustmentRule
(
	Id 														int NOT NULL primary key,
	TimezoneId 												int,
	RuleNo 													int,
	DateStart 												datetime2(7),
	DateEnd 												datetime2(7),
	DaylightTransitionStartIsFixedDateRule 					bit,
	DaylightTransitionStartMonth 							int,
	DaylightTransitionStartDay 								int,
	DaylightTransitionStartWeek 							int,
	DaylightTransitionStartDayOfWeek 						int,
	DaylightTransitionStartTimeOfDay 						time(7),
	DaylightTransitionEndIsFixedDateRule 					bit,
	DaylightTransitionEndMonth 								int,
	DaylightTransitionEndDay 								int,
	DaylightTransitionEndWeek 								int,
	DaylightTransitionEndDayOfWeek 							int,
	DaylightTransitionEndTimeOfDay 							time(7),
	DaylightDeltaSec 										int

)


CREATE UNIQUE NONCLUSTERED INDEX UX_Timezone_Identifier ON dbo.Timezone
(
	Identifier ASC
)


CREATE UNIQUE NONCLUSTERED INDEX UX_TimezoneAdjustmentRule_TimezoneId_DateStart_DateEnd ON dbo.TimezoneAdjustmentRule
(
	TimezoneId ASC,
	DateStart ASC,
	DateEnd ASC
)


ALTER TABLE dbo.TimezoneAdjustmentRule  WITH CHECK ADD  CONSTRAINT FK_TimezoneAdjustmentRule_Timezone FOREIGN KEY(TimezoneId)
REFERENCES dbo.Timezone (Id)


ALTER TABLE dbo.TimezoneAdjustmentRule CHECK CONSTRAINT FK_TimezoneAdjustmentRule_Timezone

