
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
insert into dbo.OTPSetting select 300,0,1,1,0,getdate(),1,0,null,null,0

CREATE TABLE dbo.EmailTemplate
(
	TemplateId										int primary key IDENTITY(1,1),
	TemplateName									nvarchar(100),
	TemplateType									varchar(100),
	Template										ntext,
	EmailSubject									nvarchar(1000),
	IsActive										bit NOT NULL Default(1),
	IsDeleted										bit NOT NULL Default(0),
	AddedOn											datetime NOT NULL Default(getDATE()),
	AddedBy											bigint not null default(0),
	DeletedBy										bigint not null default(0),
	DeletedOn										datetime,
	UpdatedOn										datetime ,
	UpdatedBy										bigint not null default(0)

);