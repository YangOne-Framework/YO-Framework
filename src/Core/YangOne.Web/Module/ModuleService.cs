// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Data;
using System.Data.Common;
using System.Text.Json;
using Dapper;
using YangOne.Data;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Performs database CRUD operations for modules and module lifecycle infrastructure.
    /// </summary>
    public class ModuleService : IModuleService
    {
        public CrudService<ModuleInfo> Service { get; set; } = new CrudService<ModuleInfo>();
        public CrudService<ModuleOperationJournal> OperationJournalService { get; set; } = new CrudService<ModuleOperationJournal>();
        public CrudService<ModuleMigrationHistory> MigrationHistoryService { get; set; } = new CrudService<ModuleMigrationHistory>();

        public async Task EnsureModuleManagementSchemaAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var sql = @"
IF OBJECT_ID('dbo.Module', 'U') IS NOT NULL
BEGIN
    IF COL_LENGTH('dbo.Module', 'DisplayName') IS NULL ALTER TABLE dbo.Module ADD DisplayName nvarchar(256) NULL;
    IF COL_LENGTH('dbo.Module', 'ModuleKey') IS NULL ALTER TABLE dbo.Module ADD ModuleKey nvarchar(256) NULL;
    IF COL_LENGTH('dbo.Module', 'ActiveVersion') IS NULL ALTER TABLE dbo.Module ADD ActiveVersion nvarchar(64) NULL;
    IF COL_LENGTH('dbo.Module', 'StagedVersion') IS NULL ALTER TABLE dbo.Module ADD StagedVersion nvarchar(64) NULL;
    IF COL_LENGTH('dbo.Module', 'LifecycleState') IS NULL ALTER TABLE dbo.Module ADD LifecycleState nvarchar(64) NULL;
    IF COL_LENGTH('dbo.Module', 'RuntimeState') IS NULL ALTER TABLE dbo.Module ADD RuntimeState nvarchar(64) NULL;
    IF COL_LENGTH('dbo.Module', 'PackageHash') IS NULL ALTER TABLE dbo.Module ADD PackageHash nvarchar(128) NULL;
    IF COL_LENGTH('dbo.Module', 'PackagePath') IS NULL ALTER TABLE dbo.Module ADD PackagePath nvarchar(1024) NULL;
    IF COL_LENGTH('dbo.Module', 'StagingPath') IS NULL ALTER TABLE dbo.Module ADD StagingPath nvarchar(1024) NULL;
    IF COL_LENGTH('dbo.Module', 'ManifestJson') IS NULL ALTER TABLE dbo.Module ADD ManifestJson nvarchar(max) NULL;
    IF COL_LENGTH('dbo.Module', 'LastOperation') IS NULL ALTER TABLE dbo.Module ADD LastOperation nvarchar(64) NULL;
    IF COL_LENGTH('dbo.Module', 'LastError') IS NULL ALTER TABLE dbo.Module ADD LastError nvarchar(max) NULL;
    IF COL_LENGTH('dbo.Module', 'IsRestartRequired') IS NULL ALTER TABLE dbo.Module ADD IsRestartRequired bit NOT NULL CONSTRAINT DF_Module_IsRestartRequired DEFAULT(0) WITH VALUES;
    IF COL_LENGTH('dbo.Module', 'EnabledOn') IS NULL ALTER TABLE dbo.Module ADD EnabledOn datetime NULL;
    IF COL_LENGTH('dbo.Module', 'DisabledOn') IS NULL ALTER TABLE dbo.Module ADD DisabledOn datetime NULL;

    EXEC(N'UPDATE dbo.Module SET ModuleKey = Name WHERE ModuleKey IS NULL;');

    EXEC(N'UPDATE dbo.Module SET ActiveVersion = Version WHERE ActiveVersion IS NULL AND IsInstalled = 1;');

    EXEC(N'UPDATE dbo.Module
           SET LifecycleState = CASE WHEN IsInstalled = 1 AND IsActive = 1 THEN ''Enabled''
                                     WHEN IsInstalled = 1 THEN ''InstalledDisabled''
                                     ELSE ''Uploaded'' END
           WHERE LifecycleState IS NULL;');

    EXEC(N'UPDATE dbo.Module
           SET RuntimeState = CASE WHEN IsInstalled = 1 THEN ''Loaded'' ELSE ''NotLoaded'' END
           WHERE RuntimeState IS NULL;');

    IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_Module_ModuleKey' AND object_id = OBJECT_ID('dbo.Module'))
        EXEC(N'CREATE INDEX IX_Module_ModuleKey ON dbo.Module(ModuleKey);');
END

IF OBJECT_ID('dbo.ModuleOperationJournal', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleOperationJournal
    (
        ModuleOperationJournalId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) null,
        OperationType nvarchar(64) not null,
        OperationStatus nvarchar(64) not null,
        LifecycleState nvarchar(64) not null,
        RuntimeState nvarchar(64) not null,
        Message nvarchar(max) null,
        PayloadJson nvarchar(max) null,
        ErrorJson nvarchar(max) null,
        StartedOn datetime not null default(getutcdate()),
        CompletedOn datetime null,
        RequestedBy bigint not null default(0)
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleOperationJournal_ModuleName' AND object_id = OBJECT_ID('dbo.ModuleOperationJournal'))
    CREATE INDEX IX_ModuleOperationJournal_ModuleName ON dbo.ModuleOperationJournal(ModuleName, StartedOn DESC);

IF OBJECT_ID('dbo.ModuleMigrationHistory', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleMigrationHistory
    (
        ModuleMigrationHistoryId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) not null,
        MigrationName nvarchar(256) not null,
        MigrationType nvarchar(64) not null,
        ScriptPath nvarchar(1024) not null,
        ScriptHash nvarchar(128) not null,
        Succeeded bit not null default(0),
        ErrorMessage nvarchar(max) null,
        AppliedOn datetime not null default(getutcdate()),
        AppliedBy bigint not null default(0)
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleMigrationHistory_Unique' AND object_id = OBJECT_ID('dbo.ModuleMigrationHistory'))
    CREATE UNIQUE INDEX IX_ModuleMigrationHistory_Unique ON dbo.ModuleMigrationHistory(ModuleName, ModuleVersion, ScriptHash);

IF OBJECT_ID('dbo.ModuleVersion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleVersion
    (
        ModuleVersionId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        Version nvarchar(64) not null,
        VersionPath nvarchar(1024) not null,
        PackageHash nvarchar(128) null,
        ManifestJson nvarchar(max) null,
        ValidationStatus nvarchar(64) not null,
        LifecycleState nvarchar(64) not null,
        IsActive bit not null default(0),
        IsRollbackEligible bit not null default(1),
        InstalledOn datetime null,
        AddedOn datetime not null default(getutcdate()),
        AddedBy bigint not null default(0),
        UpdatedOn datetime null,
        UpdatedBy bigint not null default(0)
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleVersion_Unique' AND object_id = OBJECT_ID('dbo.ModuleVersion'))
    CREATE UNIQUE INDEX IX_ModuleVersion_Unique ON dbo.ModuleVersion(ModuleName, Version);

IF OBJECT_ID('dbo.ModuleDependency', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleDependency
    (
        ModuleDependencyId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) not null,
        DependencyModuleName nvarchar(256) not null,
        MinimumVersion nvarchar(64) null,
        MaximumVersion nvarchar(64) null,
        IsRequired bit not null default(1),
        AddedOn datetime not null default(getutcdate())
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleDependency_Module' AND object_id = OBJECT_ID('dbo.ModuleDependency'))
    CREATE INDEX IX_ModuleDependency_Module ON dbo.ModuleDependency(ModuleName, ModuleVersion);

IF OBJECT_ID('dbo.ModulePermission', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModulePermission
    (
        ModulePermissionId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) not null,
        PermissionKey nvarchar(256) not null,
        IsActive bit not null default(1),
        AddedOn datetime not null default(getutcdate()),
        UpdatedOn datetime null
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModulePermission_Unique' AND object_id = OBJECT_ID('dbo.ModulePermission'))
    CREATE UNIQUE INDEX IX_ModulePermission_Unique ON dbo.ModulePermission(ModuleName, ModuleVersion, PermissionKey);

IF OBJECT_ID('dbo.ModuleMenu', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleMenu
    (
        ModuleMenuId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) not null,
        MenuKey nvarchar(256) not null,
        Title nvarchar(256) not null,
        Url nvarchar(512) not null,
        Icon nvarchar(256) null,
        ParentKey nvarchar(256) null,
        MenuOrder int not null default(0),
        MenuGroupId int not null default(1),
        IsBackend bit not null default(1),
        IsActive bit not null default(1),
        MenuId int null,
        AddedOn datetime not null default(getutcdate()),
        UpdatedOn datetime null
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleMenu_Unique' AND object_id = OBJECT_ID('dbo.ModuleMenu'))
    CREATE UNIQUE INDEX IX_ModuleMenu_Unique ON dbo.ModuleMenu(ModuleName, ModuleVersion, MenuKey);

IF OBJECT_ID('dbo.ModuleSetting', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ModuleSetting
    (
        ModuleSettingId bigint primary key identity(1,1) not null,
        ModuleName nvarchar(256) not null,
        ModuleVersion nvarchar(64) not null,
        SettingKey nvarchar(256) not null,
        Name nvarchar(256) not null,
        DataType nvarchar(64) null,
        DefaultValue nvarchar(max) null,
        IsRequired bit not null default(0),
        IsActive bit not null default(1),
        AddedOn datetime not null default(getutcdate()),
        UpdatedOn datetime null
    );
END

IF NOT EXISTS(SELECT 1 FROM sys.indexes WHERE name = 'IX_ModuleSetting_Unique' AND object_id = OBJECT_ID('dbo.ModuleSetting'))
    CREATE UNIQUE INDEX IX_ModuleSetting_Unique ON dbo.ModuleSetting(ModuleName, ModuleVersion, SettingKey);
";
                await db.ExecuteAsync(sql);
            }
        }

        public async Task<bool> Save(IModule module)
        {
            await EnsureModuleManagementSchemaAsync();

            var isPackagedModule = module is ManifestModule;
            var existingmodule = await GetByNameAsync(module.Name);
            var lifecycleState = module.IsInstalled ? ModuleLifecycleState.Enabled.ToString() : ModuleLifecycleState.Uploaded.ToString();
            var runtimeState = module.IsInstalled ? ModuleRuntimeState.Loaded.ToString() : ModuleRuntimeState.NotLoaded.ToString();

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                if (existingmodule == null)
                {
                    await db.ExecuteAsync(@"
INSERT INTO dbo.Module
(
    Name, DisplayName, ModuleKey, Description, Version, ActiveVersion, LifecycleState, RuntimeState,
    IsInstalled, Author, IsBuiltIn, IsActive, IsDeleted, AddedOn, AddedBy, DeletedBy,
    IsRestartRequired
)
VALUES
(
    @Name, @DisplayName, @ModuleKey, @Description, @Version, @ActiveVersion, @LifecycleState, @RuntimeState,
    @IsInstalled, @Author, @IsBuiltIn, @IsActive, 0, GETUTCDATE(), @AddedBy, 0,
    0
);",
                        new
                        {
                            module.Name,
                            DisplayName = module.Name,
                            ModuleKey = module.Name,
                            Description = string.Empty,
                            module.Version,
                            ActiveVersion = module.IsInstalled ? module.Version : null,
                            LifecycleState = lifecycleState,
                            RuntimeState = runtimeState,
                            module.IsInstalled,
                            module.Author,
                            IsBuiltIn = !isPackagedModule,
                            IsActive = module.IsInstalled,
                            AddedBy = -1
                        });
                    return true;
                }

                await db.ExecuteAsync(@"
UPDATE dbo.Module
SET DisplayName = ISNULL(DisplayName, @DisplayName),
    ModuleKey = ISNULL(ModuleKey, @ModuleKey),
    Version = @Version,
    Author = @Author,
    IsInstalled = @IsInstalled,
    IsBuiltIn = CASE WHEN @IsBuiltIn = 1 THEN 1 ELSE IsBuiltIn END,
    IsActive = CASE WHEN @IsInstalled = 1 THEN IsActive ELSE 0 END,
    RuntimeState = @RuntimeState,
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE ModuleId = @ModuleId;",
                    new
                    {
                        existingmodule.ModuleId,
                        DisplayName = module.Name,
                        ModuleKey = module.Name,
                        module.Version,
                        module.Author,
                        module.IsInstalled,
                        IsBuiltIn = !isPackagedModule,
                        RuntimeState = runtimeState,
                        UpdatedBy = -1
                    });
                return true;
            }
        }

        public async Task<ModuleInfo> GetByNameAsync(string moduleName)
        {
            if (string.IsNullOrWhiteSpace(moduleName))
                return null;

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryFirstOrDefaultAsync<ModuleInfo>(
                    "SELECT TOP 1 * FROM dbo.Module WHERE Name = @Name OR ModuleKey = @Name",
                    new { Name = moduleName });
            }
        }

        public async Task<IEnumerable<ModuleInfo>> GetAllAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<ModuleInfo>("SELECT * FROM dbo.Module WHERE IsDeleted = 0 ORDER BY Name");
            }
        }

        public async Task<bool> SavePackageAsync(ModuleManifest manifest, string packageHash, string versionPath, string stagingPath, string manifestJson, ModuleLifecycleState state, long userId)
        {
            await EnsureModuleManagementSchemaAsync();

            var existingmodule = await GetByNameAsync(manifest.Id);
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                if (existingmodule == null)
                {
                    await db.ExecuteAsync(@"
INSERT INTO dbo.Module
(
    Name, DisplayName, ModuleKey, Description, Version, ActiveVersion, StagedVersion,
    LifecycleState, RuntimeState, PackageHash, PackagePath, StagingPath, ManifestJson,
    LastOperation, IsInstalled, Author, IsBuiltIn, IsActive, IsDeleted, AddedOn, AddedBy,
    DeletedBy, IsRestartRequired
)
VALUES
(
    @Name, @DisplayName, @ModuleKey, @Description, @Version, @ActiveVersion, @StagedVersion,
    @LifecycleState, @RuntimeState, @PackageHash, @PackagePath, @StagingPath, @ManifestJson,
    @LastOperation, @IsInstalled, @Author, 0, @IsActive, 0, GETUTCDATE(), @AddedBy,
    0, @IsRestartRequired
);",
                        new
                        {
                            Name = manifest.Id,
                            DisplayName = string.IsNullOrWhiteSpace(manifest.DisplayName) ? manifest.Id : manifest.DisplayName,
                            ModuleKey = manifest.Id,
                            Description = manifest.Description ?? string.Empty,
                            Version = manifest.Version,
                            ActiveVersion = state == ModuleLifecycleState.Enabled ? manifest.Version : null,
                            StagedVersion = manifest.Version,
                            LifecycleState = state.ToString(),
                            RuntimeState = ModuleRuntimeState.NotLoaded.ToString(),
                            PackageHash = packageHash,
                            PackagePath = versionPath,
                            StagingPath = stagingPath,
                            ManifestJson = manifestJson,
                            LastOperation = ModuleOperationType.Upload.ToString(),
                            IsInstalled = false,
                            Author = manifest.Publisher,
                            IsActive = false,
                            AddedBy = userId,
                            IsRestartRequired = manifest.RestartRequired
                        });
                }
                else
                {
                    await db.ExecuteAsync(@"
UPDATE dbo.Module
SET DisplayName = @DisplayName,
    ModuleKey = @ModuleKey,
    Description = @Description,
    Version = @Version,
    StagedVersion = @StagedVersion,
    LifecycleState = @LifecycleState,
    RuntimeState = @RuntimeState,
    PackageHash = @PackageHash,
    PackagePath = @PackagePath,
    StagingPath = @StagingPath,
    ManifestJson = @ManifestJson,
    LastOperation = @LastOperation,
    LastError = NULL,
    Author = @Author,
    IsRestartRequired = @IsRestartRequired,
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE ModuleId = @ModuleId;",
                        new
                        {
                            existingmodule.ModuleId,
                            DisplayName = string.IsNullOrWhiteSpace(manifest.DisplayName) ? manifest.Id : manifest.DisplayName,
                            ModuleKey = manifest.Id,
                            Description = manifest.Description ?? string.Empty,
                            Version = manifest.Version,
                            StagedVersion = manifest.Version,
                            LifecycleState = state.ToString(),
                            RuntimeState = ModuleRuntimeState.NotLoaded.ToString(),
                            PackageHash = packageHash,
                            PackagePath = versionPath,
                            StagingPath = stagingPath,
                            ManifestJson = manifestJson,
                            LastOperation = ModuleOperationType.Upload.ToString(),
                            Author = manifest.Publisher,
                            IsRestartRequired = manifest.RestartRequired,
                            UpdatedBy = userId
                        });
                }
            }

            await SyncManifestRegistrationAsync(manifest, packageHash, versionPath, manifestJson, state, false, userId);
            return true;
        }

        public async Task<bool> SyncManifestRegistrationAsync(ModuleManifest manifest, string packageHash, string versionPath, string manifestJson, ModuleLifecycleState state, bool isActive, long userId)
        {
            await EnsureModuleManagementSchemaAsync();

            var moduleName = manifest.Id;
            var version = manifest.Version;
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                using (var tx = db.BeginTransaction())
                {
                    await db.ExecuteAsync(@"
IF EXISTS(SELECT 1 FROM dbo.ModuleVersion WHERE ModuleName = @ModuleName AND Version = @Version)
BEGIN
    UPDATE dbo.ModuleVersion
    SET VersionPath = @VersionPath,
        PackageHash = @PackageHash,
        ManifestJson = @ManifestJson,
        ValidationStatus = @ValidationStatus,
        LifecycleState = @LifecycleState,
        IsActive = @IsActive,
        InstalledOn = CASE WHEN @IsActive = 1 THEN COALESCE(InstalledOn, GETUTCDATE()) ELSE InstalledOn END,
        UpdatedOn = GETUTCDATE(),
        UpdatedBy = @UpdatedBy
    WHERE ModuleName = @ModuleName AND Version = @Version;
END
ELSE
BEGIN
    INSERT INTO dbo.ModuleVersion
    (
        ModuleName, Version, VersionPath, PackageHash, ManifestJson, ValidationStatus,
        LifecycleState, IsActive, IsRollbackEligible, InstalledOn, AddedOn, AddedBy
    )
    VALUES
    (
        @ModuleName, @Version, @VersionPath, @PackageHash, @ManifestJson, @ValidationStatus,
        @LifecycleState, @IsActive, 1, CASE WHEN @IsActive = 1 THEN GETUTCDATE() ELSE NULL END, GETUTCDATE(), @AddedBy
    );
END

IF @IsActive = 1
BEGIN
    UPDATE dbo.ModuleVersion
    SET IsActive = 0, UpdatedOn = GETUTCDATE(), UpdatedBy = @UpdatedBy
    WHERE ModuleName = @ModuleName AND Version <> @Version;
END",
                        new
                        {
                            ModuleName = moduleName,
                            Version = version,
                            VersionPath = versionPath,
                            PackageHash = packageHash,
                            ManifestJson = manifestJson,
                            ValidationStatus = state.ToString(),
                            LifecycleState = state.ToString(),
                            IsActive = isActive,
                            AddedBy = userId,
                            UpdatedBy = userId
                        }, tx);

                    await db.ExecuteAsync("DELETE FROM dbo.ModuleDependency WHERE ModuleName = @ModuleName AND ModuleVersion = @Version", new { ModuleName = moduleName, Version = version }, tx);
                    foreach (var dependency in manifest.Dependencies)
                    {
                        if (string.IsNullOrWhiteSpace(dependency.ModuleId))
                            continue;

                        await db.ExecuteAsync(@"
INSERT INTO dbo.ModuleDependency
(
    ModuleName, ModuleVersion, DependencyModuleName, MinimumVersion, MaximumVersion, IsRequired, AddedOn
)
VALUES
(
    @ModuleName, @ModuleVersion, @DependencyModuleName, @MinimumVersion, @MaximumVersion, @IsRequired, GETUTCDATE()
);",
                            new
                            {
                                ModuleName = moduleName,
                                ModuleVersion = version,
                                DependencyModuleName = dependency.ModuleId,
                                dependency.MinimumVersion,
                                dependency.MaximumVersion,
                                IsRequired = dependency.Required
                            }, tx);
                    }

                    await db.ExecuteAsync("UPDATE dbo.ModulePermission SET IsActive = 0, UpdatedOn = GETUTCDATE() WHERE ModuleName = @ModuleName AND ModuleVersion = @Version", new { ModuleName = moduleName, Version = version }, tx);
                    foreach (var permission in manifest.RequiredPermissions.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct(StringComparer.OrdinalIgnoreCase))
                    {
                        await db.ExecuteAsync(@"
IF EXISTS(SELECT 1 FROM dbo.ModulePermission WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND PermissionKey = @PermissionKey)
BEGIN
    UPDATE dbo.ModulePermission
    SET IsActive = @IsActive, UpdatedOn = GETUTCDATE()
    WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND PermissionKey = @PermissionKey;
END
ELSE
BEGIN
    INSERT INTO dbo.ModulePermission
    (
        ModuleName, ModuleVersion, PermissionKey, IsActive, AddedOn
    )
    VALUES
    (
        @ModuleName, @ModuleVersion, @PermissionKey, @IsActive, GETUTCDATE()
    );
END",
                            new
                            {
                                ModuleName = moduleName,
                                ModuleVersion = version,
                                PermissionKey = permission.Trim(),
                                IsActive = isActive
                            }, tx);
                    }

                    await SyncMenusAsync(db, tx, manifest, isActive, userId);
                    await SyncSettingsAsync(db, tx, manifest, isActive);

                    tx.Commit();
                }
            }

            return true;
        }

        public async Task<bool> DeactivateManifestRegistrationAsync(string moduleName, string version, long userId)
        {
            await EnsureModuleManagementSchemaAsync();

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
UPDATE dbo.ModuleVersion
SET IsActive = 0, LifecycleState = @LifecycleState, UpdatedOn = GETUTCDATE(), UpdatedBy = @UpdatedBy
WHERE ModuleName = @ModuleName AND (@Version = '' OR Version = @Version);

UPDATE dbo.ModulePermission
SET IsActive = 0, UpdatedOn = GETUTCDATE()
WHERE ModuleName = @ModuleName AND (@Version = '' OR ModuleVersion = @Version);

UPDATE dbo.ModuleSetting
SET IsActive = 0, UpdatedOn = GETUTCDATE()
WHERE ModuleName = @ModuleName AND (@Version = '' OR ModuleVersion = @Version);

UPDATE dbo.ModuleMenu
SET IsActive = 0, UpdatedOn = GETUTCDATE()
WHERE ModuleName = @ModuleName AND (@Version = '' OR ModuleVersion = @Version);

UPDATE m
SET m.IsActive = 0, m.UpdatedOn = GETUTCDATE(), m.UpdatedBy = @UpdatedBy
FROM dbo.Menu m
INNER JOIN dbo.ModuleMenu mm ON mm.MenuId = m.MenuId
WHERE mm.ModuleName = @ModuleName AND (@Version = '' OR mm.ModuleVersion = @Version);",
                    new
                    {
                        ModuleName = moduleName,
                        Version = version ?? string.Empty,
                        LifecycleState = ModuleLifecycleState.Disabled.ToString(),
                        UpdatedBy = userId
                    });
            }

            return true;
        }

        private static async Task SyncMenusAsync(DbConnection db, IDbTransaction tx, ModuleManifest manifest, bool isActive, long userId)
        {
            var moduleName = manifest.Id;
            var version = manifest.Version;

            await db.ExecuteAsync(@"
UPDATE dbo.ModuleMenu
SET IsActive = 0, UpdatedOn = GETUTCDATE()
WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion;

UPDATE m
SET m.IsActive = 0, m.UpdatedOn = GETUTCDATE(), m.UpdatedBy = @UpdatedBy
FROM dbo.Menu m
INNER JOIN dbo.ModuleMenu mm ON mm.MenuId = m.MenuId
WHERE mm.ModuleName = @ModuleName AND mm.ModuleVersion = @ModuleVersion;",
                new { ModuleName = moduleName, ModuleVersion = version, UpdatedBy = userId }, tx);

            foreach (var menu in manifest.Menus
                         .Where(x => !string.IsNullOrWhiteSpace(x.Key) && !string.IsNullOrWhiteSpace(x.Title) && !string.IsNullOrWhiteSpace(x.Url))
                         .GroupBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                         .Select(x => x.First()))
            {
                var menuId = await db.ExecuteScalarAsync<int?>(@"
SELECT TOP 1 MenuId
FROM dbo.ModuleMenu
WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND MenuKey = @MenuKey;",
                    new { ModuleName = moduleName, ModuleVersion = version, MenuKey = menu.Key }, tx);

                if (!menuId.HasValue)
                {
                    menuId = await db.ExecuteScalarAsync<int?>(@"
SELECT TOP 1 MenuId
FROM dbo.Menu
WHERE Url = @Url AND IsDeleted = 0;",
                        new { Url = menu.Url }, tx);
                }

                if (menuId.HasValue)
                {
                    await db.ExecuteAsync(@"
UPDATE dbo.Menu
SET Name = @Name,
    Url = @Url,
    Icon = @Icon,
    MenuOrder = @MenuOrder,
    MenuGroupId = @MenuGroupId,
    IsBackend = @IsBackend,
    IsActive = @IsActive,
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE MenuId = @MenuId;",
                        new
                        {
                            MenuId = menuId.Value,
                            Name = menu.Title,
                            Url = menu.Url,
                            Icon = menu.Icon,
                            MenuOrder = menu.Order,
                            MenuGroupId = menu.MenuGroupId <= 0 ? 1 : menu.MenuGroupId,
                            menu.IsBackend,
                            IsActive = isActive,
                            UpdatedBy = userId
                        }, tx);
                }
                else
                {
                    menuId = await db.ExecuteScalarAsync<int>(@"
INSERT INTO dbo.Menu
(
    Name, SubTitle, Url, Icon, CssClass, IsChild, ParentId, MenuOrder, MenuGroupId,
    Culture, IsBackend, IsSystem, IsActive, IsDeleted, AddedOn, AddedBy, DeletedBy
)
VALUES
(
    @Name, '', @Url, @Icon, '', 0, 0, @MenuOrder, @MenuGroupId,
    'en-US', @IsBackend, 0, @IsActive, 0, GETUTCDATE(), @AddedBy, 0
);
SELECT CAST(SCOPE_IDENTITY() AS int);",
                        new
                        {
                            Name = menu.Title,
                            Url = menu.Url,
                            Icon = menu.Icon,
                            MenuOrder = menu.Order,
                            MenuGroupId = menu.MenuGroupId <= 0 ? 1 : menu.MenuGroupId,
                            menu.IsBackend,
                            IsActive = isActive,
                            AddedBy = userId
                        }, tx);
                }

                await db.ExecuteAsync(@"
IF EXISTS(SELECT 1 FROM dbo.ModuleMenu WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND MenuKey = @MenuKey)
BEGIN
    UPDATE dbo.ModuleMenu
    SET Title = @Title,
        Url = @Url,
        Icon = @Icon,
        ParentKey = @ParentKey,
        MenuOrder = @MenuOrder,
        MenuGroupId = @MenuGroupId,
        IsBackend = @IsBackend,
        IsActive = @IsActive,
        MenuId = @MenuId,
        UpdatedOn = GETUTCDATE()
    WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND MenuKey = @MenuKey;
END
ELSE
BEGIN
    INSERT INTO dbo.ModuleMenu
    (
        ModuleName, ModuleVersion, MenuKey, Title, Url, Icon, ParentKey, MenuOrder,
        MenuGroupId, IsBackend, IsActive, MenuId, AddedOn
    )
    VALUES
    (
        @ModuleName, @ModuleVersion, @MenuKey, @Title, @Url, @Icon, @ParentKey, @MenuOrder,
        @MenuGroupId, @IsBackend, @IsActive, @MenuId, GETUTCDATE()
    );
END",
                    new
                    {
                        ModuleName = moduleName,
                        ModuleVersion = version,
                        MenuKey = menu.Key,
                        Title = menu.Title,
                        Url = menu.Url,
                        Icon = menu.Icon,
                        ParentKey = menu.ParentKey,
                        MenuOrder = menu.Order,
                        MenuGroupId = menu.MenuGroupId <= 0 ? 1 : menu.MenuGroupId,
                        menu.IsBackend,
                        IsActive = isActive,
                        MenuId = menuId.Value
                    }, tx);

                await db.ExecuteAsync(@"
INSERT INTO dbo.MenuPermission
(
    MenuId, AllowAccessForAll, AllowAccess, RoleId, IsActive, IsDeleted, AddedOn, AddedBy, DeletedBy
)
SELECT @MenuId, @AllowAccessForAll, 1, r.Id, @IsActive, 0, GETUTCDATE(), @AddedBy, 0
FROM dbo.IdentityRole r
WHERE r.NormalizedName IN ('ADMIN', 'SUPERADMIN')
AND NOT EXISTS
(
    SELECT 1
    FROM dbo.MenuPermission mp
    WHERE mp.MenuId = @MenuId AND mp.RoleId = r.Id AND mp.IsDeleted = 0
);",
                    new
                    {
                        MenuId = menuId.Value,
                        menu.AllowAccessForAll,
                        IsActive = isActive,
                        AddedBy = userId
                    }, tx);
            }

            await db.ExecuteAsync(@"
UPDATE childMenu
SET childMenu.ParentId = parent.MenuId,
    childMenu.IsChild = 1,
    childMenu.UpdatedOn = GETUTCDATE(),
    childMenu.UpdatedBy = @UpdatedBy
FROM dbo.ModuleMenu child
INNER JOIN dbo.ModuleMenu parent
    ON parent.ModuleName = child.ModuleName
    AND parent.ModuleVersion = child.ModuleVersion
    AND parent.MenuKey = child.ParentKey
INNER JOIN dbo.Menu childMenu ON childMenu.MenuId = child.MenuId
WHERE child.ModuleName = @ModuleName
AND child.ModuleVersion = @ModuleVersion
AND child.ParentKey IS NOT NULL
AND child.ParentKey <> '';",
                new { ModuleName = moduleName, ModuleVersion = version, UpdatedBy = userId }, tx);
        }

        private static async Task SyncSettingsAsync(DbConnection db, IDbTransaction tx, ModuleManifest manifest, bool isActive)
        {
            var moduleName = manifest.Id;
            var version = manifest.Version;

            await db.ExecuteAsync(@"
UPDATE dbo.ModuleSetting
SET IsActive = 0, UpdatedOn = GETUTCDATE()
WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion;",
                new { ModuleName = moduleName, ModuleVersion = version }, tx);

            foreach (var setting in manifest.Settings
                         .Where(x => !string.IsNullOrWhiteSpace(x.Key))
                         .GroupBy(x => x.Key, StringComparer.OrdinalIgnoreCase)
                         .Select(x => x.First()))
            {
                await db.ExecuteAsync(@"
IF EXISTS(SELECT 1 FROM dbo.ModuleSetting WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND SettingKey = @SettingKey)
BEGIN
    UPDATE dbo.ModuleSetting
    SET Name = @Name,
        DataType = @DataType,
        DefaultValue = @DefaultValue,
        IsRequired = @IsRequired,
        IsActive = @IsActive,
        UpdatedOn = GETUTCDATE()
    WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND SettingKey = @SettingKey;
END
ELSE
BEGIN
    INSERT INTO dbo.ModuleSetting
    (
        ModuleName, ModuleVersion, SettingKey, Name, DataType, DefaultValue, IsRequired, IsActive, AddedOn
    )
    VALUES
    (
        @ModuleName, @ModuleVersion, @SettingKey, @Name, @DataType, @DefaultValue, @IsRequired, @IsActive, GETUTCDATE()
    );
END",
                    new
                    {
                        ModuleName = moduleName,
                        ModuleVersion = version,
                        SettingKey = setting.Key,
                        Name = string.IsNullOrWhiteSpace(setting.Name) ? setting.Key : setting.Name,
                        setting.DataType,
                        setting.DefaultValue,
                        IsRequired = setting.Required,
                        IsActive = isActive
                    }, tx);
            }
        }

        public async Task<bool> UpdateStateAsync(string moduleName, string version, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string operation, string error, bool restartRequired, long userId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
UPDATE dbo.Module
SET Version = COALESCE(NULLIF(@Version, ''), Version),
    LifecycleState = @LifecycleState,
    RuntimeState = @RuntimeState,
    LastOperation = @LastOperation,
    LastError = @LastError,
    IsRestartRequired = @IsRestartRequired,
    IsInstalled = CASE WHEN @LifecycleState IN ('Enabled', 'Disabled', 'InstalledDisabled') THEN 1
                       WHEN @LifecycleState IN ('Uninstalled') THEN 0
                       ELSE IsInstalled END,
    IsActive = CASE WHEN @LifecycleState = 'Enabled' THEN 1
                    WHEN @LifecycleState IN ('Disabled', 'InstalledDisabled', 'Uninstalled') THEN 0
                    ELSE IsActive END,
    EnabledOn = CASE WHEN @LifecycleState = 'Enabled' THEN GETUTCDATE() ELSE EnabledOn END,
    DisabledOn = CASE WHEN @LifecycleState IN ('Disabled', 'InstalledDisabled') THEN GETUTCDATE() ELSE DisabledOn END,
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE Name = @Name OR ModuleKey = @Name;",
                    new
                    {
                        Name = moduleName,
                        Version = version ?? string.Empty,
                        LifecycleState = state.ToString(),
                        RuntimeState = runtimeState.ToString(),
                        LastOperation = operation,
                        LastError = error,
                        IsRestartRequired = restartRequired,
                        UpdatedBy = userId
                    });
            }

            return true;
        }

        public async Task<bool> SetActiveVersionAsync(string moduleName, string version, string versionPath, long userId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
UPDATE dbo.Module
SET Version = @Version,
    ActiveVersion = @Version,
    StagedVersion = NULL,
    PackagePath = @PackagePath,
    LifecycleState = @LifecycleState,
    RuntimeState = @RuntimeState,
    LastOperation = @LastOperation,
    LastError = NULL,
    IsInstalled = 1,
    IsActive = 1,
    IsRestartRequired = 0,
    EnabledOn = GETUTCDATE(),
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE Name = @Name OR ModuleKey = @Name;",
                    new
                    {
                        Name = moduleName,
                        Version = version,
                        PackagePath = versionPath,
                        LifecycleState = ModuleLifecycleState.Enabled.ToString(),
                        RuntimeState = ModuleRuntimeState.Loaded.ToString(),
                        LastOperation = ModuleOperationType.Install.ToString(),
                        UpdatedBy = userId
                    });

                await db.ExecuteAsync(@"
UPDATE dbo.ModuleVersion
SET IsActive = 0, UpdatedOn = GETUTCDATE(), UpdatedBy = @UpdatedBy
WHERE ModuleName = @Name;

UPDATE dbo.ModuleVersion
SET IsActive = 1,
    LifecycleState = @LifecycleState,
    ValidationStatus = @LifecycleState,
    VersionPath = @PackagePath,
    InstalledOn = COALESCE(InstalledOn, GETUTCDATE()),
    UpdatedOn = GETUTCDATE(),
    UpdatedBy = @UpdatedBy
WHERE ModuleName = @Name AND Version = @Version;",
                    new
                    {
                        Name = moduleName,
                        Version = version,
                        PackagePath = versionPath,
                        LifecycleState = ModuleLifecycleState.Enabled.ToString(),
                        UpdatedBy = userId
                    });
            }

            return true;
        }

        public async Task<bool> Uninstall(string moduleName)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
UPDATE dbo.Module
SET IsInstalled = @IsInstalled,
    IsActive = 0,
    LifecycleState = @LifecycleState,
    RuntimeState = @RuntimeState,
    LastOperation = @LastOperation,
    UpdatedOn = GETUTCDATE()
WHERE Name = @Name OR ModuleKey = @Name",
                    new
                    {
                        Name = moduleName,
                        IsInstalled = false,
                        LifecycleState = ModuleLifecycleState.Uninstalled.ToString(),
                        RuntimeState = ModuleRuntimeState.Stopped.ToString(),
                        LastOperation = ModuleOperationType.Uninstall.ToString()
                    });
                return true;
            }
        }

        public async Task<bool> ReInstall(string moduleName)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
UPDATE dbo.Module
SET IsInstalled = @IsInstalled,
    IsActive = 1,
    LifecycleState = @LifecycleState,
    RuntimeState = @RuntimeState,
    LastOperation = @LastOperation,
    UpdatedOn = GETUTCDATE()
WHERE Name = @Name OR ModuleKey = @Name",
                    new
                    {
                        Name = moduleName,
                        IsInstalled = true,
                        LifecycleState = ModuleLifecycleState.Enabled.ToString(),
                        RuntimeState = ModuleRuntimeState.Loaded.ToString(),
                        LastOperation = ModuleOperationType.Install.ToString()
                    });
                return true;
            }
        }

        public async Task<ModuleOperationJournal> AddOperationAsync(string moduleName, string version, ModuleOperationType operationType, ModuleOperationStatus status, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string message, object payload, IEnumerable<string> errors, long userId)
        {
            var entry = new ModuleOperationJournal
            {
                ModuleName = moduleName,
                ModuleVersion = version,
                OperationType = operationType.ToString(),
                OperationStatus = status.ToString(),
                LifecycleState = state.ToString(),
                RuntimeState = runtimeState.ToString(),
                Message = message,
                PayloadJson = JsonSerializer.Serialize(payload ?? new { }),
                ErrorJson = JsonSerializer.Serialize(errors ?? Array.Empty<string>()),
                StartedOn = DateTime.UtcNow,
                CompletedOn = DateTime.UtcNow,
                RequestedBy = userId
            };

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                entry.ModuleOperationJournalId = await db.ExecuteScalarAsync<long>(@"
INSERT INTO dbo.ModuleOperationJournal
(
    ModuleName, ModuleVersion, OperationType, OperationStatus, LifecycleState, RuntimeState,
    Message, PayloadJson, ErrorJson, StartedOn, CompletedOn, RequestedBy
)
VALUES
(
    @ModuleName, @ModuleVersion, @OperationType, @OperationStatus, @LifecycleState, @RuntimeState,
    @Message, @PayloadJson, @ErrorJson, @StartedOn, @CompletedOn, @RequestedBy
);
SELECT CAST(SCOPE_IDENTITY() AS bigint);", entry);
            }

            return entry;
        }

        public async Task<IEnumerable<ModuleOperationJournal>> GetOperationJournalAsync(string moduleName, int count = 50)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<ModuleOperationJournal>(
                    "SELECT TOP (@Count) * FROM dbo.ModuleOperationJournal WHERE ModuleName = @ModuleName ORDER BY StartedOn DESC",
                    new { ModuleName = moduleName, Count = count <= 0 ? 50 : count });
            }
        }

        public async Task<bool> RecordMigrationAsync(string moduleName, string version, string migrationName, string migrationType, string scriptPath, string scriptHash, bool succeeded, string errorMessage, long userId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"
IF NOT EXISTS(SELECT 1 FROM dbo.ModuleMigrationHistory WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND ScriptHash = @ScriptHash)
BEGIN
    INSERT INTO dbo.ModuleMigrationHistory
    (
        ModuleName, ModuleVersion, MigrationName, MigrationType, ScriptPath, ScriptHash,
        Succeeded, ErrorMessage, AppliedOn, AppliedBy
    )
    VALUES
    (
        @ModuleName, @ModuleVersion, @MigrationName, @MigrationType, @ScriptPath, @ScriptHash,
        @Succeeded, @ErrorMessage, GETUTCDATE(), @AppliedBy
    );
END",
                    new
                    {
                        ModuleName = moduleName,
                        ModuleVersion = version,
                        MigrationName = migrationName,
                        MigrationType = migrationType,
                        ScriptPath = scriptPath,
                        ScriptHash = scriptHash,
                        Succeeded = succeeded,
                        ErrorMessage = errorMessage,
                        AppliedBy = userId
                    });
                return true;
            }
        }

        public async Task<bool> HasMigrationAsync(string moduleName, string version, string scriptHash)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var count = await db.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM dbo.ModuleMigrationHistory WHERE ModuleName = @ModuleName AND ModuleVersion = @ModuleVersion AND ScriptHash = @ScriptHash AND Succeeded = 1",
                    new { ModuleName = moduleName, ModuleVersion = version, ScriptHash = scriptHash });
                return count > 0;
            }
        }
    }
}
