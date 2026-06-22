CREATE OR ALTER PROCEDURE [dbo].[usp_ModuleManifestRegistry_GetByModule]
    @ModuleName NVARCHAR(256)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.ModuleVersion
    WHERE ModuleName = @ModuleName
    ORDER BY InstalledOn DESC, AddedOn DESC;

    SELECT *
    FROM dbo.ModuleDependency
    WHERE ModuleName = @ModuleName
    ORDER BY ModuleVersion, DependencyModuleName;

    SELECT *
    FROM dbo.ModulePermission
    WHERE ModuleName = @ModuleName
    ORDER BY ModuleVersion, PermissionKey;

    SELECT *
    FROM dbo.ModuleMenu
    WHERE ModuleName = @ModuleName
    ORDER BY ModuleVersion, MenuOrder, Title;

    SELECT *
    FROM dbo.ModuleSetting
    WHERE ModuleName = @ModuleName
    ORDER BY ModuleVersion, SettingKey;
END
