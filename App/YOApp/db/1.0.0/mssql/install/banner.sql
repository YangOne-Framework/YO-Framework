
create TABLE dbo.Banner
(
	BannerId								int primary key identity(1,1) not null,
	[Key]									nvarchar(50) not null,
	[Name]									nvarchar(256) not null,
	TotalSlides								int not null default(0),										
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);

create table dbo.BannerItem
(
	BannerItemId							int primary key identity(1,1) not null,
	BannerId								int not null,
	Heading									nvarchar(500) ,
	SubHeading								nvarchar(1000) ,
    CTAText									nvarchar(500) ,
	CTALink									nvarchar(500) ,
	ContentPosition							nvarchar(50) ,		
	Animation								nvarchar(50) ,
	OverlayOpacity							int,
	ImageUrl								nvarchar(1000) not null,
	IsImageDirectUrl						bit NOT NULL Default(0),	
	DisplayOrder							int not null default(0),										
	IsActive                                bit NOT NULL Default(1),
	IsDeleted                               bit NOT NULL Default(0),
	AddedOn                                 datetime NOT NULL Default(getDATE()),
	AddedBy                                 bigint not null default(0),
	DeletedBy								bigint not null default(0),
	DeletedOn                               datetime,
	UpdatedOn                               datetime ,
	UpdatedBy                               bigint not null default(0)
);
GO
CREATE PROCEDURE [dbo].[USP_BannerItems_GetByKey]
    @BannerKey NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        bi.BannerItemId,
        bi.BannerId,
        bi.Heading,
        bi.SubHeading,
        bi.CTAText,
        bi.CTALink,
        bi.ContentPosition,
        bi.Animation,
        bi.OverlayOpacity,
        bi.ImageUrl,
        bi.IsImageDirectUrl,
        bi.DisplayOrder
    FROM dbo.BannerItem bi
    INNER JOIN dbo.Banner b ON bi.BannerId = b.BannerId
    WHERE 
        b.[Key] = @BannerKey
        AND bi.IsDeleted = 0
        AND b.IsActive = 1 
    ORDER BY bi.DisplayOrder ASC;
END
GO

