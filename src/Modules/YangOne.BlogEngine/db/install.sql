
create TABLE dbo.Post
(
	PostId									bigint primary key identity(1,1),
	Title									nvarchar(500) not null,
	Url										NVARCHAR(500) not null,
	ThumbnailImage							nvarchar(256),
	CoverImage								nvarchar(256),
	Content									nvarchar(max),	
	Tags									nvarchar(3000) ,
	Categories								nvarchar(3000) ,		
	PublishedOn								datetime not null default(getdate()),
	ViewCount								int DEFAULT(0),
	IsVideoContent							bit not null default(0),
	VideoLink								nvarchar(256),
    PostAuthorId							bigint not null default(0),
	RecommendationMetaTags					nvarchar(max),
	IsPublic								bit NOT NULL Default(0),
    IsActive                    bit NOT NULL DEFAULT(1),
    IsDeleted                   bit NOT NULL DEFAULT(0),
    AddedOn                     datetime NOT NULL DEFAULT(getdate()),
    AddedBy                     bigint NOT NULL DEFAULT(0),
    DeletedBy                   bigint NOT NULL DEFAULT(0),
    DeletedOn                   datetime NULL,
    UpdatedOn                   datetime NULL,
    UpdatedBy                   bigint NOT NULL DEFAULT(0)
);

create TABLE dbo.PostCategory
(
	PostCategoryId							int primary key identity(1,1),
	Name									nvarchar(256) not null,
	Url										nvarchar(256) not null,
    IsActive                    bit NOT NULL DEFAULT(1),
    IsDeleted                   bit NOT NULL DEFAULT(0),
    AddedOn                     datetime NOT NULL DEFAULT(getdate()),
    AddedBy                     bigint NOT NULL DEFAULT(0),
    DeletedBy                   bigint NOT NULL DEFAULT(0),
    DeletedOn                   datetime NULL,
    UpdatedOn                   datetime NULL,
    UpdatedBy                   bigint NOT NULL DEFAULT(0)
);
CREATE  TABLE dbo.PostSetting
(
	PostSettingId							int primary key identity(1,1),
	RecentPostPerPage                      int not null,
	RecentPostPerRow						int not null default(4),
	UseNextPrev								bit default(0),	
	ShowDescriptionInRecentPost				bit default(0),
	ShowDescriptionInLine					int not null


);

INSERT INTO [dbo].[PostSetting]
           (RecentPostPerPage,
		   RecentPostPerRow
           ,UseNextPrev
           ,ShowDescriptionInRecentPost
           ,ShowDescriptionInLine           
           )
     VALUES
           (12
           ,4
           ,0
           ,1,
		   5
           )


--
-- Create or alter function [dbo].[RetriveTextFromHTML]
--
         GO
         PRINT (N'Create or alter function [dbo].[RetriveTextFromHTML]')
         GO
Create OR ALTER function  dbo.RetriveTextFromHTML(@htmlstring varchar(Max))

    returns varchar(Max)

    AS

BEGIN

Set @htmlstring=Replace(@htmlstring,'&nbsp;',' ');
Set @htmlstring=Replace(@htmlstring,'Note:','');
DECLARE @startTag varchar(25) = '%[<]%'
DECLARE @endTag varchar(25) = '%[>]%'
Declare @endTagIndex int =0;
Declare @startTagIndex int =0;
WHILE PATINDEX(@startTag,@htmlstring)>0
Begin
        Set @startTagIndex=PATINDEX(@startTag,@htmlstring);
        Set @endTagIndex=PATINDEX(@endTag,@htmlstring);
        SET @htmlstring = Stuff(@htmlstring,@startTagIndex,(@endTagIndex-@startTagIndex)+1,'');
End

return RTRIM(@htmlstring)

END
GO


Insert Into dbo.Page Select 'Blog Posts','admin/blog/post','','',1,1,1,'en-us',GETUTCDATE(),GETUTCDATE(),1,1,0,GETUTCDATE(),'System';

--superadmin
INSERT INTO PagePermission SELECT PageId,0,1,1,GETUTCDATE(),'system' FROM dbo.Page where Name in ('Blog Posts');
--admin
INSERT INTO PagePermission  SELECT PageId,0,1,2,GETUTCDATE(),'system' FROM dbo.Page where Name in ( 'Blog Posts');

declare @bMenuId int
INSERT INTO [dbo].[Menu] Select 'Blog','','#','settings','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),'system';
set @bMenuId=Scope_Identity();
INSERT INTO [dbo].[Menu] Select 'Posts','','/admin/blog/post','list','material-icons md-18',0,@bMenuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),'system';
INSERT INTO [dbo].[Menu] Select 'Categories','','/admin/blog/category','group_work','material-icons md-18',0,@bMenuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),'system';
INSERT INTO [dbo].[Menu] Select 'Setting','','/admin/blog/setting','settings','material-icons md-18',0,@bMenuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),'system';

--superadmin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,1,GETUTCDATE(),'system'
FROM menu where  Name in('Blog','Posts','Categories','Setting');
--admin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,2,GETUTCDATE(),'system' FROM menu AS l 
where  Name in('Blog','Posts','Categories','Setting');

