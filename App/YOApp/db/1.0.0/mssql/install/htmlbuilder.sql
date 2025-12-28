create TABLE dbo.HtmlComponent
(
	HtmlComponentId								          int primary key identity(1,1) not null,
	[Name]									                nvarchar(256) not null,
  DisplayName                             nvarchar(256) not null,
  ShortDescription                        nvarchar(500),
  Icon                                    nvarchar(50),
  PreviewImage                            nvarchar(500),
  Config                                  nvarchar(max),
  ContentStructure                        nvarchar(max),
  HtmlTemplate                            nvarchar(max),							
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								                bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);