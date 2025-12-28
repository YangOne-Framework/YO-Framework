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
CREATE TABLE [dbo].[UserLoginHistory](
	[UserLoginHistoryId]  bigint not null primary key identity(1,1),
	[UserId] [bigint] NOT NULL,
	[IpAddress] [nvarchar](256) NULL,
	[LastLogin] [datetime] NULL,
	[IsFromWeb] [bit] NULL,
	[IsFromMobile] [bit] NULL,
	[UserDevice] [nvarchar](2000) NULL,
	[Browser] [nvarchar](256) NULL,
	[Device] [nvarchar](256) NULL,
	IsActive													bit NOT NULL Default(1),
	IsDeleted													bit NOT NULL Default(0),
	AddedOn														datetime NOT NULL Default(getDATE()),
	AddedBy														bigint not null default(0),
	DeletedBy													bigint not null default(0),
	DeletedOn													datetime,
	UpdatedOn													datetime ,
	UpdatedBy													bigint not null default(0)
)