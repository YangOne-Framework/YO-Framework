CREATE TABLE dbo.AppUser
(		AppUserId								bigint primary key identity(1,1),
		IdentityUserId							bigint not null,
		FirstName								nvarchar(256) ,
        LastName								nvarchar(256),
        Bio										nvarchar(2000),
        Email									nvarchar(256) not null,
        Address									nvarchar(256)  null,      
        PhoneNumber								nvarchar(256)  null,        
        DOB										nvarchar(256)  null,
        ProfilePicture							nvarchar(256)  null,
		Gender									nvarchar(10) null, -- m:male, f:female, o:other			
		UserName							    nvarchar(256) not null,		
		Designation								nvarchar(256),
		FacebookLink							nvarchar(256),
		LinkedInLink							nvarchar(256),
		TweeterLink								nvarchar(256),
		InstagramLink							nvarchar(256),		
		CoverImage								nvarchar(256),			
		IsActive                                bit NOT NULL Default(1),
		IsDeleted                               bit NOT NULL Default(0),
		AddedOn                                 datetime NOT NULL Default(getDATE()),
		AddedBy                                 bigint not null default(0),
		DeletedBy								bigint not null default(0),
		DeletedOn                               datetime,
		UpdatedOn                               datetime ,
		UpdatedBy                               bigint not null default(0)
);
create TABLE dbo.IdentityRole
(
	Id 										bigint primary key IDENTITY(1,1) NOT NULL,
	ConcurrencyStamp						nvarchar(max) NULL,
	Name									nvarchar(256) NULL,
	NormalizedName							nvarchar(256) NULL,
	IsTemporary								 bit NOT NULL Default(0),
	IsSystem								bit default(0) not null,
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);
CREATE TABLE dbo.TemporaryRoleDetail
(
	Id 										bigint primary key IDENTITY(1,1) NOT NULL,
	RoleId									bigint NOT NULL default(0),
	StartDate								datetime not null Default(getDATE()),
	EndDate									datetime not null Default(getDATE()),
	Narration								nvarchar(max)
);
CREATE TABLE dbo.IdentityRoleClaim
(
	Id									int primary key IDENTITY(1,1) NOT NULL,
	ClaimType							nvarchar(max) NULL,
	ClaimValue							nvarchar(max) NULL,
	RoleId								bigint references dbo.IdentityRole NOT NULL
);
CREATE TABLE dbo.IdentityUser
(
	Id									bigint primary key identity(1,1) NOT NULL,
	AccessFailedCount					int NOT NULL,
	ConcurrencyStamp					nvarchar(max) NULL,
	Email								nvarchar(256) NULL,
	EmailConfirmed						bit NOT NULL,
	LockoutEnabled						bit NOT NULL,
	LockoutEnd							datetimeoffset(7) NULL,
	NormalizedEmail						nvarchar(256) NULL,
	NormalizedUserName					nvarchar(256) NULL,
	PasswordHash						nvarchar(max) NULL,
	PhoneNumber							nvarchar(max) NULL,
	PhoneNumberConfirmed				bit NOT NULL,
	SecurityStamp						nvarchar(max) NULL,
	TwoFactorEnabled					bit NOT NULL,
	UserName							nvarchar(256) NULL
);

CREATE TABLE dbo.IdentityUserClaim
(
	Id 									bigint  primary key IDENTITY(1,1) NOT NULL,
	ClaimType							nvarchar(max) NULL,
	ClaimValue							nvarchar(max) NULL,
	UserId								bigint  NOT NULL references dbo.IdentityUser
 );

CREATE TABLE dbo.IdentityUserLogin
(
	LoginProvider						nvarchar(450) NOT NULL,--index
	ProviderKey							nvarchar(450) NOT NULL,--
	ProviderDisplayName					nvarchar(max) NULL,
	UserId								bigint  NOT NULL references dbo.IdentityUser
);	
--drop index dbo.IdentityUserLogin.idx_ext_lgn 
--CREATE CLUSTERED  INDEX idx_ext_lgn
--	ON dbo.IdentityUserLogin 					(LoginProvider, ProviderKey);

CREATE TABLE dbo.IdentityUserRole
(
	UserId								bigint NOT NULL references dbo.IdentityUser,
	RoleId								bigint NOT NULL references dbo.IdentityRole
);
--ok
--drop index dbo.IdentityUserRole.idx_usr_lgn 
CREATE CLUSTERED INDEX idx_usr_lgn
	ON dbo.IdentityUserRole 					(UserId, RoleId);

CREATE TABLE dbo.IdentityUserToken
(
	UserId								bigint NOT NULL references dbo.IdentityUser,
	LoginProvider						nvarchar(450) NOT NULL,
	Name								nvarchar(450) NOT NULL,
	Value								nvarchar(max) NULL
);
--drop index dbo.IdentityUserToken.idx_usr_tkns 
--CREATE  INDEX idx_usr_tkns
--	ON dbo.IdentityUserToken 					(UserId, LoginProvider)
--	include (Name)
create table dbo.RTCUser
(
	RTCUserId				int primary key not null identity(1,1),
	IdentityUserId			bigint not null default(0),
	SessionId				nvarchar(500) default(''),
	GroupName				nvarchar(256) default(''),
	UserRoles				nvarchar(1000) default(''),
	IsFromWeb				bit default(0),
	IsFromMobile			bit default(0),
	UserDevice				nvarchar(2000) default(''),--android or useragent
	ConnectionId			nvarchar(500) not null,
	HubName					nvarchar(256) not null,--cart support chat
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)

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

CREATE  Table dbo.LocaleRegion
(
	LocaleRegionId								int primary key identity(1,1) not null,
	CountryId                           		int not null default(0),
	Flag										nvarchar(256),
	Culture										varchar(10),
	IsDefault 									bit NOT NULL Default(0),
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);
CREATE TABLE dbo.LocaleResource 
(
    LocaleResourceId				int primary key identity(1,1) not null,
    Culture							varchar (10)    not null,
    Name							varchar (100)   not null,
    Value							nvarchar (4000) not null,
    GroupName						nvarchar(256)
);
CREATE  INDEX idx_localization
	ON dbo.LocaleResource (Culture, GroupName);
--drop index dbo.LocaleResource.idx_localization 

CREATE TABLE dbo.Module
(
	ModuleId								int primary key identity(1,1) not null,
	Name									nvarchar(256) not null,
	Description								nvarchar(max) ,
	Version									nvarchar(256) not null,
	IsInstalled								bit default(0) not null,
	Author									nvarchar(256),
	IsBuiltIn								bit default(0) not null,
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)

);

create TABLE dbo.Page
(
	PageId									bigint primary key identity(1,1) not null,
	Name									nvarchar(256) NOT NULL,
	URL										nvarchar(256),	
	Content									nvarchar(max) NULL,
	ContentConfig							nvarchar(max)  null,
	UseMasterLayout							bit default(0) not null,
    IsPublished								bit default(0) not null,
	IsBackend								bit default(0) not null,
	Culture									nvarchar (10)  not null,
	LastModified							datetime NOT NULL,
	LastRequested							datetime NULL,
	ModuleId								int not null default(0),
	IsSystem								bit default(1),
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);


CREATE TABLE dbo.Plugin
(
	PluginId								int primary key identity(1,1) not null,
	PluginType								int not null,
	Name									nvarchar(256) not null,
	SystemName								nvarchar(256) not null,
	Image									nvarchar(256) ,
	Version									nvarchar(256) not null,
	Author									nvarchar(256) not null,
	Description								nvarchar(max),
	IsInstalled								bit default(0),
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

Create Table dbo.MenuGroup
(
	MenuGroupId								int primary key identity(1,1) not null,
	Name									nvarchar(256) not null,
	Description								nvarchar(max) ,	
	IsSystem								bit not null default(0),
    IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

Create Table dbo.Menu
(
	MenuId									int primary key identity(1,1) not null,
	Name									nvarchar(256) not null,
	SubTitle								nvarchar(256),
	Url										nvarchar(256) not null,
	Icon									nvarchar(256),
	CssClass								nvarchar(256),
	IsChild									bit default(0) not null,
	ParentId								int default(0) not null,
	MenuOrder								int default(0) not null,
	MenuGroupId								int not null default(0),--main,side side2
	Culture									nvarchar (10)  not null,
	IsBackend								bit default(0) not null,
	IsSystem								bit default(0) not null,
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

Create table dbo.MenuPermission
(
	MenuPermissionId						int primary key identity(1,1) not null,
	MenuId									int not null default(0),
	AllowAccessForAll						bit default(0) not null,
	AllowAccess								bit default(0) not null,
	RoleId									bigint not null,
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);
Create Table dbo.MenuSetting
(	
	MenuSettingId							int primary key identity(1,1) not null,
	MenuGroupName							nvarchar(256) not null,
	MenuGroupId								int references dbo.MenuGroup,
	ShowMenuAs								nvarchar(256) not null,--sidebar footer footer2,main navigation 
	CssClasses								nvarchar(256)

);

CREATE TABLE dbo.SEO
(
	SEOId									int primary key IDENTITY(1,1),
	MetaTitle								nvarchar(256)  null,
	MetaKeyWords							nvarchar(256)  null,
	MetaDescription							nvarchar(max) null,
	SeoType									nvarchar(256) not null,--page,product..
	LastUrl									nvarchar(256) null,
	Url										nvarchar(256) not null,
	Image									nvarchar(256) ,
	PageName								nvarchar(256) null,
	PageId								 	int default(0),
	ProductId								int null default(0),
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)

);
CREATE table dbo.Setting
(
	SettingId								int primary key identity(1,1) not null,
	WebsiteName								nvarchar(256) not null,
	Description								nvarchar(500),
	CountryId								int default(0) ,	
	Address1								nvarchar(256),
	Address2								nvarchar(256),
	PhoneNumber								nvarchar(256),
	Email									nvarchar(256), 	
	State 									nvarchar(256),
	City									nvarchar(256),
	TimeZoneId								int default(0),
	Longitude								decimal(16,4) default(0),
	Lattitude								decimal(16,4) default(0),	
	Logo									nvarchar(256) not null,
	BaseCulture 							nvarchar(10) not null,
	BaseCurrency							nvarchar(5) not null,		
	CurrencyCode							nvarchar(5) not null,
	GoogleAnalyticScript 					nvarchar(1000) null,
	UseHttps								bit default(0) NOT NULL,
	DefaultEmail							nvarchar(256),
	SupportEmail							nvarchar(256),
	SalesEmail								nvarchar(256),
	MarketingEmail							nvarchar(256)

);
Create table dbo.AuditLog
(
	AuditId									bigint primary key identity(1,1) not null,
	Url										nvarchar(500),
	Action									nvarchar(500),
	Duration								int not null default(0),
	UserName								nvarchar(500),
	Role 									nvarchar(500),
	IpAddress								nvarchar(500),
	UserAgent								nvarchar(1000),
	RequestObject							nvarchar(max),
	AddedOn									datetime default(getdate())
);

CREATE TABLE dbo.Sessions(  
    Id									nvarchar(449)  PRIMARY KEY NOT NULL,  
    Value								varbinary(max) NOT NULL,  
    ExpiresAtTime						datetimeoffset(7) NOT NULL,  
    SlidingExpirationInSeconds			bigint NULL,  
    AbsoluteExpiration					datetimeoffset(7) NULL
	)

CREATE NONCLUSTERED INDEX [Index_ExpiresAtTime] ON [dbo].[Sessions]  
(  
    [ExpiresAtTime] ASC  
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)  

CREATE TABLE dbo.SMSGateway
( 
	SMSGatewayId										int primary key identity(1,1) not null,
	Name												nvarchar(256) not null,
	Description											nvarchar(1000),
	Image												nvarchar(256),
	IsDefault											bit default(0) not null,
    IsActive											bit NOT NULL Default(1),
	IsDeleted											bit NOT NULL Default(0),
	AddedOn												datetime NOT NULL Default(getDATE()),
	AddedBy												bigint not null default(0),
	DeletedBy											bigint not null default(0),
	DeletedOn											datetime,
	UpdatedOn											datetime ,
	UpdatedBy											bigint not null default(0)

);
CREATE TABLE dbo.SMSGatewaySetting
( 
   SMSGatewaySettingId								int primary key identity(1,1) not null,
   SMSGatewayId										int not null,
   GatewayKey										nvarchar(256) not null,
   GatewayValue										nvarchar(256) not null

);
Create Table dbo.SMSLog
(
	SMSLogId										bigint primary key identity(1,1) not null,
	[From]											nvarchar(256),
	[To]											nvarchar(256),	
	[Body]											nvarchar(max),	
	IsSent											bit default(0),
	IsDelivered										bit default(0),
	SentDate										datetime default(getutcdate()),
	DeliveredDate									datetime not null,
	GatewayResponse									nvarchar(1000),
	AddedOn											datetime default(getutcdate()),
	AddedBy											nvarchar(256) not null
);

CREATE TABLE dbo.EmailServiceProvider
( 
	EmailServiceProviderId						int primary key identity(1,1) not null,
	Name										nvarchar(256) not null,
	Description									nvarchar(1000),
	Image										nvarchar(256),
	IsDefault									bit default(0) not null,
	IsActive									bit NOT NULL Default(1),
	IsDeleted									bit NOT NULL Default(0),
	AddedOn										datetime NOT NULL Default(getDATE()),
	AddedBy										bigint not null default(0),
	DeletedBy									bigint not null default(0),
	DeletedOn									datetime,
	UpdatedOn									datetime ,
	UpdatedBy									bigint not null default(0)

);
CREATE TABLE dbo.EmailServiceProviderSetting
( 
   EmailServiceProviderSettingId						int primary key identity(1,1) not null,
   EmailServiceProviderId								int not null,
   ProviderKey											nvarchar(256) not null,
   ProviderValue										nvarchar(256) not null

);
Create Table dbo.EmailLog
(
	EmailLogId										bigint primary key identity(1,1) not null,
	[From]											nvarchar(256),
	[To]											nvarchar(256),
	[Subject]										nvarchar(500),
	[Body]											nvarchar(max),
	[CC]											nvarchar(2000),
	[BCC]											nvarchar(2000),
	IsSent											bit default(0),
	IsDelivered										bit default(0),
	SentDate										datetime default(getutcdate()),
	DeliveredDate									datetime not null,
	GatewayResponse									nvarchar(1000),
	AddedOn											datetime default(getutcdate()) not null,
	AddedBy											nvarchar(256) not null
);
--ipv4 ipv6 domain email creditcard customer
Create Table dbo.RestrictionKey
(
	RestrictionKeyId						int primary key identity(1,1) not null,	 
	Name									nvarchar(256) not null,
	IsSystem								bit default(0) not null,
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
	 
);
Create table dbo.Restriction
(
	RestrictionId							int primary key identity(1,1) not null,
	RestrictionKeyId						int references dbo.RestrictionKey,
	Value									nvarchar(256) not null,
	Reason									nvarchar(500) not null,
	Narration								nvarchar(500),
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);
create table dbo.AdministrativeIPAccess
(
	AdministrativeIPAccessId						int primary key identity(1,1) not null,
	RoleId											bigint not null,
	AllowIPV4										nvarchar(256) not null,--*
	AllowIPV6										nvarchar(500) not null, --*
	ActivateIPV6									bit default(0) not null,--if true check only ipv6 if not ipv4
	IsRange											bit default(0) not null,
	IPV4Range										nvarchar(500),--192.168.0.1-192.168.0.254
	IPV6Range										nvarchar(1000),--FE80:0:0:0:202:B3FF:FE1E:8329-FE80:0:0:0:202:B3FF:FE1E:8329	
	IsActive										bit NOT NULL Default(1),
	IsDeleted										bit NOT NULL Default(0),
	AddedOn											datetime NOT NULL Default(getDATE()),
	AddedBy											bigint not null default(0),
	DeletedBy										bigint not null default(0),
	DeletedOn										datetime,
	UpdatedOn										datetime ,
	UpdatedBy										bigint not null default(0)
);

CREATE TABLE dbo.UserSecretKey
(
	UserSecretKeyId												bigint not null primary key identity(1,1),
	UserId														bigint not null default(0),
	SecretKey													nvarchar(500) not null,
	IsActive													bit NOT NULL Default(1),
	IsDeleted													bit NOT NULL Default(0),
	AddedOn														datetime NOT NULL Default(getDATE()),
	AddedBy														bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn													datetime,
	UpdatedOn													datetime ,
	UpdatedBy													bigint not null default(0)
);

CREATE TABLE dbo.OTPSetting
(
	OTPSettingId									bigint not null primary key identity(1,1),
	ExpiryTime										int not null default(60),--in seconds
	SendFromSms										bit default(1) not null,
	SendFromEmail									bit default(1) not null,
	IsActive										bit NOT NULL Default(1),
	IsDeleted										bit NOT NULL Default(0),
	AddedOn											datetime NOT NULL Default(getDATE()),
	AddedBy											bigint not null default(0),
	DeletedBy										bigint not null default(0),
	DeletedOn										datetime,
	UpdatedOn										datetime ,
	UpdatedBy										bigint not null default(0)

);

CREATE TABLE dbo.UserOTP
(
	UserOTPId					bigint not null primary key identity(1,1),
	UserId						bigint not null default(0),
	OTPCode						nvarchar(500) not null,
	IsExpired					bit default(0) not null
);
CREATE TABLE dbo.UnSubscription 
(
	UnSubscriptionId								int not null primary key identity(1,1),
	Email											nvarchar(256) not null,
	Newsletter										bit NOT NULL DEFAULT (0),
	Promotional										bit NOT NULL DEFAULT (0),
	Informative										bit NOT NULL DEFAULT (0),
	Transactional									bit NOT NULL DEFAULT (0),
	AllEmail										bit NOT NULL DEFAULT (0),
	IsActive										bit NOT NULL Default(1),
	IsDeleted										bit NOT NULL Default(0),
	AddedOn											datetime NOT NULL Default(getDATE()),
	AddedBy											bigint not null default(0),
	DeletedBy										bigint not null default(0),
	DeletedOn										datetime,
	UpdatedOn										datetime ,
	UpdatedBy										bigint not null default(0)
 
);


CREATE TABLE dbo.EmailTemplate
(
	TemplateId										int primary key IDENTITY(1,1),
	TemplateName									nvarchar(100),
	TemplateType									varchar(100),
	Template										ntext,
	EmailSubject									nvarchar(1000),
	HeaderTemplate 									ntext,
	FooterTemplate 									ntext,
	IsActive										bit NOT NULL Default(1),
	IsDeleted										bit NOT NULL Default(0),
	AddedOn											datetime NOT NULL Default(getDATE()),
	AddedBy											bigint not null default(0),
	DeletedBy										bigint not null default(0),
	DeletedOn										datetime,
	UpdatedOn										datetime ,
	UpdatedBy										bigint not null default(0)

);
CREATE TABLE dbo.UserDevice
(
	UserDeviceId 												bigint not null primary key identity(1,1),
	UserId														bigint not null,
	DeviceId													nvarchar(500) not null,
	IsWeb														bit default(0),
	IsMobile    												bit default(0),	
	Browser	        											nvarchar(256),
	BrowserVersion												nvarchar(50),
	OS															nvarchar(256),
	Version														nvarchar(50),
	IsVerified													bit default(0),
	IsActive													bit NOT NULL Default(1),
	IsDeleted													bit NOT NULL Default(0),
	AddedOn														datetime NOT NULL Default(getDATE()),
	AddedBy														bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn													datetime,
	UpdatedOn													datetime ,
	UpdatedBy													bigint not null default(0)

);
CREATE TABLE dbo.UserFCMDevice
(
	UserFCMDeviceId 											bigint not null primary key identity(1,1),
	UserId														bigint not null,
	DeviceId													nvarchar(500) not null,	
	GroupName													nvarchar(256),
	OS															nvarchar(256),
	Version														nvarchar(50),	
	IsActive													bit NOT NULL Default(1),
	IsDeleted													bit NOT NULL Default(0),
	AddedOn														datetime NOT NULL Default(getDATE()),
	AddedBy														bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn													datetime,
	UpdatedOn													datetime ,
	UpdatedBy													bigint not null default(0)

);
CREATE TABLE [dbo].[UserLoginHistory]
(
	[UserLoginHistoryId]  										bigint not null primary key identity(1,1),
	[UserId] 													bigint NOT NULL,
	[IpAddress] 												nvarchar(256) NULL,
	[LastLogin] 												datetime NULL,
	[IsFromWeb] 												bit NULL,
	[IsFromMobile] 												bit NULL,
	[UserDevice] 												nvarchar(2000) NULL,
	[Browser] 													nvarchar(256) NULL,
	[Device] 													nvarchar(256) NULL,
	IsActive													bit NOT NULL Default(1),
	IsDeleted													bit NOT NULL Default(0),
	AddedOn														datetime NOT NULL Default(getDATE()),
	AddedBy														bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn													datetime,
	UpdatedOn													datetime ,
	UpdatedBy													bigint not null default(0)
);



CREATE TABLE dbo.ApplicationController
(
	ApplicationControllerId										int not null primary key identity(1,1),
	Name														nvarchar(500) not null

);
CREATE TABLE dbo.ApplicationControllerAction
(
	ApplicationControllerActionId								int not null primary key identity(1,1),
	ApplicationControllerId										int not null default(0),
	ActionUrl													nvarchar(500),
	RouteUrl													nvarchar(500),
	FriendlyName												nvarchar(500)

);
create TABLE dbo.MasterRolePermission
(
	MasterRolePermissionId										bigint primary key identity(1,1) not null,
	ApplicationControllerActionId								int not null default(0),
	ApplicationControllerId										int not null default(0),
	RoleId														bigint not null,	
	AllowAccess													bit default(0) not null,										
	IsActive                                					bit NOT NULL Default(1),
	IsDeleted                               					bit NOT NULL Default(0),
	AddedOn                                 					datetime NOT NULL Default(getDATE()),
	AddedBy                                 					bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn                               					datetime,
	UpdatedOn                               					datetime ,
	UpdatedBy                               					bigint not null default(0)
);

create table dbo.UserPermission
(
	UserPermissionId											bigint primary key identity(1,1) not null,
	ApplicationControllerActionId								int not null default(0),
	ApplicationControllerId										int not null default(0),	
	AllowAccess													bit default(0) not null,		
	UserId														bigint not null,								
	IsActive                                					bit NOT NULL Default(1),
	IsDeleted                               					bit NOT NULL Default(0),
	AddedOn                                 					datetime NOT NULL Default(getDATE()),
	AddedBy                                 					bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn                               					datetime,
	UpdatedOn                               					datetime ,
	UpdatedBy                               					bigint not null default(0)
);
create table dbo.OpenIddictApplications
(
    Id                                                  nvarchar(450) primary key not null,
    ApplicationType                                     nvarchar(50) null,
    ClientId                                            nvarchar(100) null,
    ClientSecret                                        nvarchar(max) null,
    ClientType                                          nvarchar(50) null,
    ConcurrencyToken                                    nvarchar(50) null,
    ConsentType                                         nvarchar(50) null,
    DisplayName                                         nvarchar(max) null,
    DisplayNames                                        nvarchar(max) null,
    JsonWebKeySet                                       nvarchar(max) null,
    Permissions                                         nvarchar(max) null,
    PostLogoutRedirectUris                              nvarchar(max) null,
    Properties                                          nvarchar(max) null,
    RedirectUris                                        nvarchar(max) null,
    Requirements                                        nvarchar(max) null,
    Settings                                            nvarchar(max) null
);

create table dbo.OpenIddictAuthorizations
(
    Id                                                  nvarchar(450) primary key not null,
    ApplicationId                                       nvarchar(450) null references dbo.OpenIddictApplications(Id),
    ConcurrencyToken                                    nvarchar(50) null,
    CreationDate                                        datetime2(7) null,
    Properties                                          nvarchar(max) null,
    Scopes                                              nvarchar(max) null,
    Status                                              nvarchar(50) null,
    Subject                                             nvarchar(400) null,
    Type                                                nvarchar(50) null
);

create table dbo.OpenIddictScopes
(
    Id                                                  nvarchar(450) primary key not null,
    ConcurrencyToken                                    nvarchar(50) null,
    Description                                         nvarchar(max) null,
    Descriptions                                        nvarchar(max) null,
    DisplayName                                         nvarchar(max) null,
    DisplayNames                                        nvarchar(max) null,
    Name                                                nvarchar(200) null,
    Properties                                          nvarchar(max) null,
    Resources                                           nvarchar(max) null
);

create table dbo.OpenIddictTokens
(
    Id                                                  nvarchar(450) primary key not null,
    ApplicationId                                       nvarchar(450) null references dbo.OpenIddictApplications(Id),
    AuthorizationId                                     nvarchar(450) null references dbo.OpenIddictAuthorizations(Id),
    ConcurrencyToken                                    nvarchar(50) null,
    CreationDate                                        datetime2(7) null,
    ExpirationDate                                      datetime2(7) null,
    Payload                                             nvarchar(max) null,
    Properties                                          nvarchar(max) null,
    RedemptionDate                                      datetime2(7) null,
    ReferenceId                                         nvarchar(100) null,
    Status                                              nvarchar(50) null,
    Subject                                             nvarchar(400) null,
    Type                                                nvarchar(500) null
);

create TABLE dbo.HtmlComponent
(
	HtmlComponentId								        int primary key identity(1,1) not null,
	[Name]									            nvarchar(256) not null,
  	DisplayName                             			nvarchar(256) not null,
  	ShortDescription                        			nvarchar(500),
  	Icon                                    			nvarchar(50),
  	PreviewImage                            			nvarchar(500),
  	Config                                  			nvarchar(max),
  	ContentStructure                        			nvarchar(max),
  	HtmlTemplate                            			nvarchar(max),		
	StateSchema 										NVARCHAR(MAX) NULL,
    ApiBindings 										NVARCHAR(MAX) NULL,
    EventBindings 										NVARCHAR(MAX) NULL,
    RuntimeOptions 										NVARCHAR(MAX) NULL,
    Version 											NVARCHAR(50) NULL,					
	IsActive                                			bit NOT NULL Default(1),
	IsDeleted                               			bit NOT NULL Default(0),
	AddedOn                                 			datetime NOT NULL Default(getDATE()),
	AddedBy                                 			bigint not null default(0),
	DeletedBy								            bigint not null default(0),
	DeletedOn                               			datetime,
	UpdatedOn                               			datetime ,
	UpdatedBy                               			bigint not null default(0)
);
create table dbo.Timezone
(
    Id                                                  int identity(1,1) primary key not null,
    Identifier                                          nvarchar(100) null,
    StandardName                                        nvarchar(100) null,
    DisplayName                                         nvarchar(100) null,
    DaylightName                                        nvarchar(100) null,
    SupportsDaylightSavingTime                          bit null,
    BaseUtcOffsetSec                                    int null,
    UTC                                                 nvarchar(15) null
);

CREATE TABLE [dbo].[TimezoneAdjustmentRule](
	[Id] [int] NOT NULL,
	[TimezoneId] [int] NULL,
	[RuleNo] [int] NULL,
	[DateStart] [datetime2](7) NULL,
	[DateEnd] [datetime2](7) NULL,
	[DaylightTransitionStartIsFixedDateRule] [bit] NULL,
	[DaylightTransitionStartMonth] [int] NULL,
	[DaylightTransitionStartDay] [int] NULL,
	[DaylightTransitionStartWeek] [int] NULL,
	[DaylightTransitionStartDayOfWeek] [int] NULL,
	[DaylightTransitionStartTimeOfDay] [time](7) NULL,
	[DaylightTransitionEndIsFixedDateRule] [bit] NULL,
	[DaylightTransitionEndMonth] [int] NULL,
	[DaylightTransitionEndDay] [int] NULL,
	[DaylightTransitionEndWeek] [int] NULL,
	[DaylightTransitionEndDayOfWeek] [int] NULL,
	[DaylightTransitionEndTimeOfDay] [time](7) NULL,
	[DaylightDeltaSec] [int] NULL,
 CONSTRAINT [PK_TimezoneAdjustmentRule] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
)


CREATE UNIQUE NONCLUSTERED INDEX [UX_Timezone_Identifier] ON [dbo].[Timezone]
(
	[Identifier] ASC
)


CREATE UNIQUE NONCLUSTERED INDEX [UX_TimezoneAdjustmentRule_TimezoneId_DateStart_DateEnd] ON [dbo].[TimezoneAdjustmentRule]
(
	[TimezoneId] ASC,
	[DateStart] ASC,
	[DateEnd] ASC
)


ALTER TABLE [dbo].[TimezoneAdjustmentRule]  WITH CHECK ADD  CONSTRAINT [FK_TimezoneAdjustmentRule_Timezone] FOREIGN KEY([TimezoneId])
REFERENCES [dbo].[Timezone] ([Id])


ALTER TABLE [dbo].[TimezoneAdjustmentRule] CHECK CONSTRAINT [FK_TimezoneAdjustmentRule_Timezone]
