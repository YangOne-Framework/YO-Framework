INSERT INTO [dbo].[MenuGroup] Select 'Admin Menu','Admin Menu',1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[MenuGroup] Select 'Main Navigation','Main Navigation',1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[MenuGroup] Select 'Footer Navigation','Footer Navigation',1,1,0,GETUTCDATE(),1,0,null,null,0

DECLARE @menuId INT;

-- Dashboard

INSERT INTO [dbo].[Menu]
SELECT 'Dashboard','','/admin/dashboard','home','',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;



-- Content Management

INSERT INTO [dbo].[Menu]
SELECT 'Content Management','','#','dashboard_customize','',0,0,2,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

SET @menuId = SCOPE_IDENTITY();
INSERT INTO [dbo].[Menu]
SELECT 'Content Studio','','/admin/content/studio','manage_search','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'SEO Management','','/admin/seo','manage_search','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Menu','','/admin/menu','menu','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Media Library','','/admin/media','perm_media','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Html Builder','','/admin/htmlbuilder','html','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Html Component Builder','','/admin/componentbuilder','widgets','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;



-- Settings

INSERT INTO [dbo].[Menu]
SELECT 'Settings','','#','settings','',0,0,3,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

SET @menuId = SCOPE_IDENTITY();

INSERT INTO [dbo].[Menu]
SELECT 'Basic','','/admin/setting/basic','tune','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Content Security Policy','','/admin/setting/csp','security','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'API Config','','/admin/setting/api','api','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Optimization','','/admin/setting/optimization','speed','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'File','','/admin/setting/file','folder','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Web Setting','','/admin/setting/web','public','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Caching','','/admin/setting/caching','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Email Service Provider','','/admin/setting/emailserviceprovider','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'SMS Service Provider','','/admin/setting/smsserviceprovider','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Email Templates','','/admin/setting/emailtemplate','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Admin IP-Access','','/admin/setting/ipaccess','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Restriction','','/admin/setting/restriction','cached','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

-- System

INSERT INTO [dbo].[Menu]
SELECT 'System','','#','admin_panel_settings','',0,0,4,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

SET @menuId = SCOPE_IDENTITY();

INSERT INTO [dbo].[Menu]
SELECT 'Client','','/admin/client','business','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'User','','/admin/user','person','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Role','','/admin/role','manage_accounts','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;
INSERT INTO [dbo].[Menu]
SELECT 'Permission','','/admin/permission','bug_report','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Localization','','/admin/localization','translate','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Modules','','/admin/module','extension','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

INSERT INTO [dbo].[Menu]
SELECT 'Dev Logs','','/admin/logs','bug_report','',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,NULL,NULL,0;

--superadmin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,1,1,0,GETUTCDATE(),1,0,null,null,0 FROM dbo.Menu AS l;
--admin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,2,1,0,GETUTCDATE(),1,0,null,null,0 FROM dbo.Menu AS l;