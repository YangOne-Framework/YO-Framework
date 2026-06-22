using System.IO.Compression;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using YangOne.Data;
using YangOne.Data.Crud;
using YangOne.Log;
using YangOne.Web.Module;

namespace YangOne.Web.Tests.Module;

public class ModuleManagerTests
{
    [Fact]
    public async Task InstallPackageAsync_runs_install_migration_and_activates_version()
    {
        using var app = new ModuleTestApp();
        var versionPath = app.CreateModuleVersion("Test.Inventory", "1.0.0", "install", "SELECT 'install';");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.Inventory",
            ModuleKey = "Test.Inventory",
            Version = "1.0.0",
            StagedVersion = "1.0.0",
            PackagePath = versionPath
        });

        var result = await app.Manager.InstallPackageAsync("Test.Inventory", "1.0.0", 7);

        Assert.True(result.Succeeded);
        Assert.True(result.RequiresRestart);
        Assert.Equal(ModuleLifecycleState.Enabled, result.State);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("install"));

        var module = app.ModuleService.Modules["Test.Inventory"];
        Assert.True(module.IsInstalled);
        Assert.True(module.IsActive);
        Assert.Equal("1.0.0", module.ActiveVersion);
        Assert.Equal(ModuleLifecycleState.Enabled.ToString(), module.LifecycleState);
        Assert.Equal(ModuleRuntimeState.NotLoaded.ToString(), module.RuntimeState);
        Assert.True(File.Exists(Path.Combine(app.ModuleRoot("Test.Inventory"), "active-version.json")));
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "install" && x.Succeeded);
        Assert.Contains(app.ModuleService.SyncedRegistrations, x => x.ModuleName == "Test.Inventory" && x.Version == "1.0.0" && x.IsActive);
    }

    [Fact]
    public async Task UpgradeAsync_runs_version_specific_upgrade_migration_and_switches_active_version()
    {
        using var app = new ModuleTestApp();
        app.CreateModuleVersion("Test.Inventory", "1.0.0", "install", "SELECT 'install';");
        var targetPath = app.CreateModuleVersion("Test.Inventory", "1.1.0", "upgrade", "SELECT 'upgrade';", "1.0.0", "1.1.0");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.Inventory",
            ModuleKey = "Test.Inventory",
            Version = "1.0.0",
            ActiveVersion = "1.0.0",
            StagedVersion = "1.1.0",
            PackagePath = targetPath,
            IsInstalled = true,
            IsActive = true,
            LifecycleState = ModuleLifecycleState.Enabled.ToString()
        });

        var result = await app.Manager.UpgradeAsync("Test.Inventory", "1.1.0", 7);

        Assert.True(result.Succeeded);
        Assert.True(result.RequiresRestart);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("upgrade"));

        var module = app.ModuleService.Modules["Test.Inventory"];
        Assert.Equal("1.1.0", module.ActiveVersion);
        Assert.Equal("1.1.0", module.Version);
        Assert.True(module.IsInstalled);
        Assert.Equal(ModuleLifecycleState.Enabled.ToString(), module.LifecycleState);
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "upgrade" && x.ModuleVersion == "1.1.0" && x.Succeeded);

        var activeVersion = JsonSerializer.Deserialize<ModuleVersionPointer>(
            File.ReadAllText(Path.Combine(app.ModuleRoot("Test.Inventory"), "active-version.json")));
        Assert.Equal("1.1.0", activeVersion.Version);
        Assert.Contains(app.ModuleService.SyncedRegistrations, x => x.ModuleName == "Test.Inventory" && x.Version == "1.1.0" && x.IsActive);
    }

    [Fact]
    public async Task UninstallPackageAsync_runs_uninstall_migration_and_marks_module_uninstalled()
    {
        using var app = new ModuleTestApp();
        app.CreateModuleVersion("Test.Inventory", "1.0.0", "uninstall", "SELECT 'uninstall';");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.Inventory",
            ModuleKey = "Test.Inventory",
            Version = "1.0.0",
            ActiveVersion = "1.0.0",
            IsInstalled = true,
            IsActive = true,
            LifecycleState = ModuleLifecycleState.Enabled.ToString()
        });

        var result = await app.Manager.UninstallPackageAsync("Test.Inventory", true, 7);

        Assert.True(result.Succeeded);
        Assert.Equal(ModuleLifecycleState.Uninstalled, result.State);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("uninstall"));

        var module = app.ModuleService.Modules["Test.Inventory"];
        Assert.False(module.IsInstalled);
        Assert.False(module.IsActive);
        Assert.Equal(ModuleLifecycleState.Uninstalled.ToString(), module.LifecycleState);
        Assert.Equal(ModuleRuntimeState.Stopped.ToString(), module.RuntimeState);
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "uninstall" && x.Succeeded);
        Assert.Contains(app.ModuleService.DeactivatedRegistrations, x => x.ModuleName == "Test.Inventory" && x.Version == "1.0.0");
    }

    [Fact]
    public async Task InstallPackageAsync_runs_embedded_install_migration_without_database_folder()
    {
        using var app = new ModuleTestApp();
        var versionPath = app.CreateEmbeddedModuleVersion("Test.EmbeddedInventory", "1.0.0");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.EmbeddedInventory",
            ModuleKey = "Test.EmbeddedInventory",
            Version = "1.0.0",
            StagedVersion = "1.0.0",
            PackagePath = versionPath
        });

        var result = await app.Manager.InstallPackageAsync("Test.EmbeddedInventory", "1.0.0", 7);

        Assert.True(result.Succeeded);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("embedded install"));
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "install" && x.ScriptPath.StartsWith("embedded:") && x.Succeeded);
    }

    [Fact]
    public async Task UpgradeAsync_runs_embedded_version_specific_upgrade_migration()
    {
        using var app = new ModuleTestApp();
        app.CreateEmbeddedModuleVersion("Test.EmbeddedInventory", "1.0.0");
        var targetPath = app.CreateEmbeddedModuleVersion("Test.EmbeddedInventory", "1.1.0");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.EmbeddedInventory",
            ModuleKey = "Test.EmbeddedInventory",
            Version = "1.0.0",
            ActiveVersion = "1.0.0",
            StagedVersion = "1.1.0",
            PackagePath = targetPath,
            IsInstalled = true,
            IsActive = true,
            LifecycleState = ModuleLifecycleState.Enabled.ToString()
        });

        var result = await app.Manager.UpgradeAsync("Test.EmbeddedInventory", "1.1.0", 7);

        Assert.True(result.Succeeded);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("embedded upgrade"));
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "upgrade" && x.ScriptPath.StartsWith("embedded:") && x.Succeeded);
    }

    [Fact]
    public async Task UninstallPackageAsync_runs_embedded_uninstall_migration_without_database_folder()
    {
        using var app = new ModuleTestApp();
        app.CreateEmbeddedModuleVersion("Test.EmbeddedInventory", "1.0.0");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.EmbeddedInventory",
            ModuleKey = "Test.EmbeddedInventory",
            Version = "1.0.0",
            ActiveVersion = "1.0.0",
            IsInstalled = true,
            IsActive = true,
            LifecycleState = ModuleLifecycleState.Enabled.ToString()
        });

        var result = await app.Manager.UninstallPackageAsync("Test.EmbeddedInventory", true, 7);

        Assert.True(result.Succeeded);
        Assert.Contains(app.ScriptRunner.Scripts, x => x.Contains("embedded uninstall"));
        Assert.Contains(app.ModuleService.Migrations, x => x.MigrationType == "uninstall" && x.ScriptPath.StartsWith("embedded:") && x.Succeeded);
    }

    [Fact]
    public async Task InstallPackageAsync_reruns_install_migration_after_purge_reinstall()
    {
        using var app = new ModuleTestApp();
        var versionPath = app.CreateModuleVersion("Test.Inventory", "1.0.0", "install", "SELECT 'install';");
        app.CreateModuleVersion("Test.Inventory", "1.0.0", "uninstall", "SELECT 'uninstall';");
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.Inventory",
            ModuleKey = "Test.Inventory",
            Version = "1.0.0",
            StagedVersion = "1.0.0",
            PackagePath = versionPath
        });

        var firstInstall = await app.Manager.InstallPackageAsync("Test.Inventory", "1.0.0", 7);
        var uninstall = await app.Manager.UninstallPackageAsync("Test.Inventory", true, 7);
        var secondInstall = await app.Manager.InstallPackageAsync("Test.Inventory", "1.0.0", 7);

        Assert.True(firstInstall.Succeeded);
        Assert.True(uninstall.Succeeded);
        Assert.True(secondInstall.Succeeded);
        Assert.Equal(2, app.ScriptRunner.Scripts.Count(x => x.Contains("SELECT 'install'")));
    }

    [Fact]
    public async Task ValidatePackageAsync_rejects_path_traversal_zip_entries()
    {
        using var app = new ModuleTestApp();
        var packagePath = Path.Combine(app.RootPath, "unsafe.zip");
        var unsafeSource = Path.Combine(app.RootPath, "unsafe-source");
        Directory.CreateDirectory(Path.Combine(unsafeSource, "inner"));
        await File.WriteAllTextAsync(Path.Combine(unsafeSource, "evil.txt"), "bad");

        using (var archive = ZipFile.Open(packagePath, ZipArchiveMode.Create))
        {
            archive.CreateEntryFromFile(Path.Combine(unsafeSource, "evil.txt"), "../evil.txt");
        }

        var result = await app.Manager.ValidatePackageAsync(packagePath);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, x => x.Contains("unsafe path"));
    }

    [Fact]
    public async Task ValidatePackageAsync_accepts_package_without_frontend_or_database_folders()
    {
        using var app = new ModuleTestApp();
        var packagePath = app.CreateModulePackage(new ModuleManifest
        {
            Id = "Test.Headless",
            DisplayName = "Headless",
            Version = "1.0.0",
            Publisher = "YO Tests",
            EntryAssembly = "Test.Headless.dll",
            DatabaseProviders = new List<string> { "SQLServer" },
            Migrations = new List<ModuleMigrationDefinition>
            {
                new() { Name = "install", Type = "install", Path = "embedded" }
            }
        }, includeFrontend: false);

        var result = await app.Manager.ValidatePackageAsync(packagePath);

        Assert.True(result.IsValid);
        Assert.DoesNotContain(result.Warnings, x => x.Contains("frontend", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task ValidatePackageAsync_rejects_circular_dependency_graph()
    {
        using var app = new ModuleTestApp();
        app.ModuleService.Seed(new ModuleInfo
        {
            Name = "Test.Core",
            ModuleKey = "Test.Core",
            Version = "1.0.0",
            ActiveVersion = "1.0.0",
            IsInstalled = true,
            ManifestJson = JsonSerializer.Serialize(new ModuleManifest
            {
                Id = "Test.Core",
                Version = "1.0.0",
                EntryAssembly = "Test.Core.dll",
                Dependencies = new List<ModuleDependency>
                {
                    new() { ModuleId = "Test.Inventory", Required = true }
                }
            })
        });

        var packagePath = app.CreateModulePackage(new ModuleManifest
        {
            Id = "Test.Inventory",
            DisplayName = "Inventory",
            Version = "1.0.0",
            Publisher = "YO Tests",
            EntryAssembly = "Test.Inventory.dll",
            DatabaseProviders = new List<string> { "SQLServer" },
            Dependencies = new List<ModuleDependency>
            {
                new() { ModuleId = "Test.Core", Required = true }
            }
        });

        var result = await app.Manager.ValidatePackageAsync(packagePath);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, x => x.Contains("Circular module dependency"));
    }
}

internal sealed class ModuleTestApp : IDisposable
{
    public ModuleTestApp()
    {
        RootPath = Path.Combine(Path.GetTempPath(), "yo-module-tests", Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(RootPath);

        ModuleService = new FakeModuleService();
        ScriptRunner = new RecordingScriptRunner();
        Container = new ModuleContainer(Array.Empty<IModule>());
        Manager = new ModuleManager(
            Container,
            ScriptRunner,
            ModuleService,
            new TestWebHostEnvironment(RootPath),
            new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["YangOneAppConfig:Version"] = "1.0.0"
                })
                .Build(),
            new TestLogger());
    }

    public string RootPath { get; }
    public FakeModuleService ModuleService { get; }
    public RecordingScriptRunner ScriptRunner { get; }
    public ModuleContainer Container { get; }
    public ModuleManager Manager { get; }

    public string ModuleRoot(string moduleName)
    {
        return Path.Combine(RootPath, "App_Data", "Modules", moduleName);
    }

    public string CreateModuleVersion(string moduleName, string version, string migrationType, string migrationSql, string fromVersion = null, string toVersion = null)
    {
        var versionPath = Path.Combine(ModuleRoot(moduleName), "versions", version);
        var backendPath = Path.Combine(versionPath, "backend");
        var frontendPath = Path.Combine(versionPath, "frontend");
        Directory.CreateDirectory(backendPath);
        Directory.CreateDirectory(frontendPath);

        File.WriteAllText(Path.Combine(versionPath, "module.json"), JsonSerializer.Serialize(new ModuleManifest
        {
            Id = moduleName,
            DisplayName = moduleName,
            Version = version,
            Publisher = "YO Tests",
            EntryAssembly = $"{moduleName}.dll",
            ReactEntryPoint = "index.html",
            RestartRequired = true,
            DatabaseProviders = new List<string> { "SQLServer" }
        }, new JsonSerializerOptions { WriteIndented = true }));

        File.WriteAllText(Path.Combine(backendPath, $"{moduleName}.dll"), "not-a-real-assembly");
        File.WriteAllText(Path.Combine(frontendPath, "index.html"), "<html></html>");

        var migrationPath = Path.Combine(versionPath, "database", migrationType);
        if (!string.IsNullOrWhiteSpace(fromVersion) && !string.IsNullOrWhiteSpace(toVersion))
            migrationPath = Path.Combine(migrationPath, $"{fromVersion}_to_{toVersion}");

        Directory.CreateDirectory(migrationPath);
        File.WriteAllText(Path.Combine(migrationPath, "001.sql"), migrationSql);
        return versionPath;
    }

    public string CreateEmbeddedModuleVersion(string moduleName, string version)
    {
        var versionPath = Path.Combine(ModuleRoot(moduleName), "versions", version);
        var backendPath = Path.Combine(versionPath, "backend");
        Directory.CreateDirectory(backendPath);

        var testAssemblyPath = typeof(ModuleManagerTests).Assembly.Location;
        var entryAssembly = Path.GetFileName(testAssemblyPath);
        File.Copy(testAssemblyPath, Path.Combine(backendPath, entryAssembly), true);

        File.WriteAllText(Path.Combine(versionPath, "module.json"), JsonSerializer.Serialize(new ModuleManifest
        {
            Id = moduleName,
            DisplayName = moduleName,
            Version = version,
            Publisher = "YO Tests",
            EntryAssembly = entryAssembly,
            RestartRequired = true,
            DatabaseProviders = new List<string> { "SQLServer" },
            Migrations = new List<ModuleMigrationDefinition>
            {
                new() { Name = "install", Type = "install", Path = "embedded" }
            }
        }, new JsonSerializerOptions { WriteIndented = true }));

        return versionPath;
    }

    public string CreateModulePackage(ModuleManifest manifest, bool includeFrontend = true)
    {
        var sourcePath = Path.Combine(RootPath, "package-source-" + Guid.NewGuid().ToString("N"));
        var backendPath = Path.Combine(sourcePath, "backend");
        Directory.CreateDirectory(backendPath);

        File.WriteAllText(Path.Combine(sourcePath, "module.json"), JsonSerializer.Serialize(manifest, new JsonSerializerOptions { WriteIndented = true }));
        File.WriteAllText(Path.Combine(backendPath, manifest.EntryAssembly), "not-a-real-assembly");
        if (includeFrontend)
        {
            var frontendPath = Path.Combine(sourcePath, "frontend");
            Directory.CreateDirectory(frontendPath);
            File.WriteAllText(Path.Combine(frontendPath, manifest.ReactEntryPoint ?? "index.html"), "<html></html>");
        }

        var packagePath = Path.Combine(RootPath, $"{manifest.Id}-{manifest.Version}.zip");
        ZipFile.CreateFromDirectory(sourcePath, packagePath);
        return packagePath;
    }

    public void Dispose()
    {
        if (Directory.Exists(RootPath))
            Directory.Delete(RootPath, true);
    }
}

internal sealed class FakeModuleService : IModuleService
{
    public Dictionary<string, ModuleInfo> Modules { get; } = new(StringComparer.OrdinalIgnoreCase);
    public List<ModuleOperationJournal> Journals { get; } = new();
    public List<ModuleMigrationHistory> Migrations { get; } = new();
    public List<(string ModuleName, string Version, bool IsActive)> SyncedRegistrations { get; } = new();
    public List<(string ModuleName, string Version)> DeactivatedRegistrations { get; } = new();
    public CrudService<ModuleInfo> Service { get; set; }
    public CrudService<ModuleOperationJournal> OperationJournalService { get; set; }
    public CrudService<ModuleMigrationHistory> MigrationHistoryService { get; set; }

    public void Seed(ModuleInfo module)
    {
        Modules[module.ModuleKey ?? module.Name] = module;
    }

    public Task EnsureModuleManagementSchemaAsync()
    {
        return Task.CompletedTask;
    }

    public Task<bool> Save(IModule module)
    {
        Modules[module.Name] = new ModuleInfo
        {
            Name = module.Name,
            ModuleKey = module.Name,
            Version = module.Version,
            ActiveVersion = module.IsInstalled ? module.Version : null,
            IsInstalled = module.IsInstalled,
            IsActive = module.IsInstalled,
            Author = module.Author,
            LifecycleState = module.IsInstalled ? ModuleLifecycleState.Enabled.ToString() : ModuleLifecycleState.Uploaded.ToString(),
            RuntimeState = module.IsInstalled ? ModuleRuntimeState.Loaded.ToString() : ModuleRuntimeState.NotLoaded.ToString()
        };
        return Task.FromResult(true);
    }

    public Task<ModuleInfo> GetByNameAsync(string moduleName)
    {
        Modules.TryGetValue(moduleName, out var module);
        return Task.FromResult(module);
    }

    public Task<IEnumerable<ModuleInfo>> GetAllAsync()
    {
        return Task.FromResult<IEnumerable<ModuleInfo>>(Modules.Values.ToList());
    }

    public Task<bool> SavePackageAsync(ModuleManifest manifest, string packageHash, string versionPath, string stagingPath, string manifestJson, ModuleLifecycleState state, long userId)
    {
        Modules[manifest.Id] = new ModuleInfo
        {
            Name = manifest.Id,
            ModuleKey = manifest.Id,
            DisplayName = manifest.DisplayName,
            Version = manifest.Version,
            StagedVersion = manifest.Version,
            PackageHash = packageHash,
            PackagePath = versionPath,
            StagingPath = stagingPath,
            ManifestJson = manifestJson,
            LifecycleState = state.ToString(),
            RuntimeState = ModuleRuntimeState.NotLoaded.ToString(),
            IsRestartRequired = manifest.RestartRequired
        };
        return Task.FromResult(true);
    }

    public Task<bool> SyncManifestRegistrationAsync(ModuleManifest manifest, string packageHash, string versionPath, string manifestJson, ModuleLifecycleState state, bool isActive, long userId)
    {
        SyncedRegistrations.Add((manifest.Id, manifest.Version, isActive));
        return Task.FromResult(true);
    }

    public Task<bool> DeactivateManifestRegistrationAsync(string moduleName, string version, long userId)
    {
        DeactivatedRegistrations.Add((moduleName, version));
        return Task.FromResult(true);
    }

    public Task<bool> UpdateStateAsync(string moduleName, string version, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string operation, string error, bool restartRequired, long userId)
    {
        var module = GetOrCreate(moduleName);
        if (!string.IsNullOrWhiteSpace(version))
            module.Version = version;

        module.LifecycleState = state.ToString();
        module.RuntimeState = runtimeState.ToString();
        module.LastOperation = operation;
        module.LastError = error;
        module.IsRestartRequired = restartRequired;
        module.IsInstalled = state is ModuleLifecycleState.Enabled or ModuleLifecycleState.Disabled or ModuleLifecycleState.InstalledDisabled;
        module.IsActive = state == ModuleLifecycleState.Enabled;
        return Task.FromResult(true);
    }

    public Task<bool> SetActiveVersionAsync(string moduleName, string version, string versionPath, long userId)
    {
        var module = GetOrCreate(moduleName);
        module.Version = version;
        module.ActiveVersion = version;
        module.StagedVersion = null;
        module.PackagePath = versionPath;
        module.LifecycleState = ModuleLifecycleState.Enabled.ToString();
        module.RuntimeState = ModuleRuntimeState.Loaded.ToString();
        module.IsInstalled = true;
        module.IsActive = true;
        module.IsRestartRequired = false;
        return Task.FromResult(true);
    }

    public Task<bool> Uninstall(string moduleName)
    {
        var module = GetOrCreate(moduleName);
        module.IsInstalled = false;
        module.IsActive = false;
        module.LifecycleState = ModuleLifecycleState.Uninstalled.ToString();
        module.RuntimeState = ModuleRuntimeState.Stopped.ToString();
        return Task.FromResult(true);
    }

    public Task<bool> ReInstall(string moduleName)
    {
        var module = GetOrCreate(moduleName);
        module.IsInstalled = true;
        module.IsActive = true;
        module.LifecycleState = ModuleLifecycleState.Enabled.ToString();
        module.RuntimeState = ModuleRuntimeState.Loaded.ToString();
        return Task.FromResult(true);
    }

    public Task<ModuleOperationJournal> AddOperationAsync(string moduleName, string version, ModuleOperationType operationType, ModuleOperationStatus status, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string message, object payload, IEnumerable<string> errors, long userId)
    {
        var entry = new ModuleOperationJournal
        {
            ModuleOperationJournalId = Journals.Count + 1,
            ModuleName = moduleName,
            ModuleVersion = version,
            OperationType = operationType.ToString(),
            OperationStatus = status.ToString(),
            LifecycleState = state.ToString(),
            RuntimeState = runtimeState.ToString(),
            Message = message,
            StartedOn = DateTime.UtcNow,
            CompletedOn = DateTime.UtcNow,
            RequestedBy = userId
        };
        Journals.Add(entry);
        return Task.FromResult(entry);
    }

    public Task<IEnumerable<ModuleOperationJournal>> GetOperationJournalAsync(string moduleName, int count = 50)
    {
        return Task.FromResult<IEnumerable<ModuleOperationJournal>>(Journals.Where(x => x.ModuleName == moduleName).Take(count).ToList());
    }

    public Task<bool> RecordMigrationAsync(string moduleName, string version, string migrationName, string migrationType, string scriptPath, string scriptHash, bool succeeded, string errorMessage, long userId)
    {
        Migrations.Add(new ModuleMigrationHistory
        {
            ModuleName = moduleName,
            ModuleVersion = version,
            MigrationName = migrationName,
            MigrationType = migrationType,
            ScriptPath = scriptPath,
            ScriptHash = scriptHash,
            Succeeded = succeeded,
            ErrorMessage = errorMessage,
            AppliedOn = DateTime.UtcNow,
            AppliedBy = userId
        });
        return Task.FromResult(true);
    }

    public Task<bool> HasMigrationAsync(string moduleName, string version, string scriptHash)
    {
        return Task.FromResult(Migrations.Any(x => x.ModuleName == moduleName && x.ModuleVersion == version && x.ScriptHash == scriptHash && x.Succeeded));
    }

    private ModuleInfo GetOrCreate(string moduleName)
    {
        if (!Modules.TryGetValue(moduleName, out var module))
        {
            module = new ModuleInfo
            {
                Name = moduleName,
                ModuleKey = moduleName
            };
            Modules[moduleName] = module;
        }

        return module;
    }
}

internal sealed class RecordingScriptRunner : IScriptRunner
{
    public List<string> Scripts { get; } = new();

    public Task<bool> Run(string[] scripts)
    {
        Scripts.AddRange(scripts);
        return Task.FromResult(true);
    }

    public Task<bool> Run(Dialect dialect, string connectionString, string[] scripts)
    {
        Scripts.AddRange(scripts);
        return Task.FromResult(true);
    }

    public Task<bool> CheckConnection(Dialect dialect, string connectionString)
    {
        return Task.FromResult(true);
    }
}

internal sealed class TestLogger : ILogger
{
    public bool Log(LogType logtype, Func<string> messageFunc, object obj = null)
    {
        return true;
    }

    public bool CreateFile<T>()
    {
        return true;
    }

    public bool CreateFile(string name)
    {
        return true;
    }
}

internal sealed class TestWebHostEnvironment : IWebHostEnvironment
{
    public TestWebHostEnvironment(string contentRootPath)
    {
        ContentRootPath = contentRootPath;
        WebRootPath = Path.Combine(contentRootPath, "wwwroot");
        Directory.CreateDirectory(WebRootPath);
        ContentRootFileProvider = new PhysicalFileProvider(ContentRootPath);
        WebRootFileProvider = new PhysicalFileProvider(WebRootPath);
    }

    public string ApplicationName { get; set; } = "YangOne.Web.Tests";
    public IFileProvider ContentRootFileProvider { get; set; }
    public string ContentRootPath { get; set; }
    public string EnvironmentName { get; set; } = "Development";
    public string WebRootPath { get; set; }
    public IFileProvider WebRootFileProvider { get; set; }
}
