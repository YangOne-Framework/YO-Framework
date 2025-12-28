-- truncate table dbo.MenuSetting
-- truncate table dbo.MenuGroup
-- truncate table [dbo].[Menu]
-- truncate table MenuPermission
-- INSERT INTO [dbo].[MenuGroup] Select 'Admin Menu','Admin Menu',1,1,0,GETUTCDATE(),1,0,null,null,0
-- INSERT INTO [dbo].[MenuGroup] Select 'Main Navigation','Main Navigation',1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[MenuGroup] Select 'Footer Navigation','Footer Navigation',1,1,0,GETUTCDATE(),1,0,null,null,0
--INSERT INTO MenuSetting	SELECT 'Admin Menu',5,'sidemenu','nav-sidenavigation'; 
declare @menuId int;

--dashboard
INSERT INTO [dbo].[Menu] Select 'Dashboard','','/admin/dashboard','home','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0



--THEMES
INSERT INTO [dbo].[Menu] Select 'Themes','','#','palette','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
set @menuId=Scope_Identity();
INSERT INTO [dbo].[Menu] Select 'Manage','','/admin/theme/manage','settings','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Customize','','/admin/theme/customize','reorder','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0

----DEV TOOLS
--INSERT INTO [dbo].[Menu] Select 'Dev Tools','','#','build','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
--set @menuId=Scope_Identity();
--INSERT INTO [dbo].[Menu] Select 'Logs','','/admin/dev/log','error','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
--INSERT INTO [dbo].[Menu] Select 'Sql','','/admin/dev/sql','search','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
--INSERT INTO [dbo].[Menu] Select 'Cli','','/admin/dev/cli','computer','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
----SETTINGS


--WEB
INSERT INTO [dbo].[Menu] Select 'Content Management','','#','language','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
set @menuId=Scope_Identity();
INSERT INTO [dbo].[Menu] Select 'Page','','/admin/page','pages','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Menu','','/admin/menu','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Template Editor','','/admin/template/editor','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Media Library','','/admin/media','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Html Content','','/admin/html','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Html Content Builder','','/admin/html/builder','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'SEO','','/admin/seo','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0


INSERT INTO [dbo].[Menu] Select 'Settings','','#','settings','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
set @menuId=Scope_Identity();
INSERT INTO [dbo].[Menu] Select 'CSP','','/admin/setting/csp','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'API Config','','/admin/setting/api','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Optimization','','/admin/setting/optimization','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'OTP','','/admin/setting/otp','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Email Config','','/admin/setting/email','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'SMS Config','','/admin/setting/sms','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'File','','/admin/setting/file','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'File Storage','','/admin/setting/file/storage','security','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0

INSERT INTO [dbo].[Menu] Select 'Web Setting','','/admin/setting/web','settings','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Caching','','/admin/setting/caching','cached','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0

INSERT INTO [dbo].[Menu] Select 'System','','#','settings','material-icons md-18',0,0,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
set @menuId=Scope_Identity();
INSERT INTO [dbo].[Menu] Select 'Module','','/admin/module','web','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Plugin','','/admin/plugins','web','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'User','','/admin/user','people','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Role','','/admin/role','group_add','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Localization','','/admin/localization','g_translate','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Audit Logs','','/admin/audit','folder_open','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0
INSERT INTO [dbo].[Menu] Select 'Dev Logs','','/admin/dev/log','folder_open','material-icons md-18',0,@menuId,1,1,'en-US',1,1,1,0,GETUTCDATE(),1,0,null,null,0

--superadmin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,1,1,0,GETUTCDATE(),1,0,null,null,0 FROM dbo.Menu AS l;
--admin
INSERT INTO MenuPermission 	SELECT MenuId,0,1,2,1,0,GETUTCDATE(),1,0,null,null,0 FROM dbo.Menu AS l;