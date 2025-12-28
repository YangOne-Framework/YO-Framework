

CREATE TABLE dbo.ApplicationController
(
	ApplicationControllerId				int not null primary key identity(1,1),
	Name								nvarchar(500) not null

);
CREATE TABLE dbo.ApplicationControllerAction
(
	ApplicationControllerActionId				int not null primary key identity(1,1),
	ApplicationControllerId						int not null default(0),
	ActionUrl									nvarchar(500),
	RouteUrl									nvarchar(500),
	FriendlyName								nvarchar(500)

);
create TABLE dbo.MasterRolePermission
(
	MasterRolePermissionId					bigint primary key identity(1,1) not null,
	ApplicationControllerActionId			int not null default(0),
	ApplicationControllerId					int not null default(0),
	RoleId									bigint not null,	
	AllowAccess								bit default(0) not null,										
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

create table dbo.UserPermission
(
	UserPermissionId						bigint primary key identity(1,1) not null,
	ApplicationControllerActionId			int not null default(0),
	ApplicationControllerId					int not null default(0),	
	AllowAccess								bit default(0) not null,		
	UserId									bigint not null,								
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

