// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.IO.Compression;
using System.Reflection;
using System.Runtime.Loader;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using YangOne.Extensions;
using YangOne.Log;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Manages module installation, package validation, version activation and runtime discovery.
    /// </summary>
    public class ModuleManager : IModuleManager
    {
        private static readonly Regex ModuleIdPattern = new("^[A-Za-z][A-Za-z0-9_.-]{1,127}$", RegexOptions.Compiled);
        private static readonly HashSet<string> ForbiddenExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".bat", ".cmd", ".com", ".exe", ".msi", ".pif", ".ps1", ".reg", ".scr", ".vbs"
        };

        private readonly ModuleContainer _moduleContainer;
        private readonly IScriptRunner _scriptRunner;
        private readonly IModuleService _moduleService;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IConfiguration _configuration;
        private readonly ILogger _logger;
        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
            WriteIndented = true
        };

        public ModuleManager(
            ModuleContainer moduleContainer,
            IScriptRunner scriptRunner,
            IModuleService moduleService,
            IWebHostEnvironment hostingEnvironment,
            IConfiguration configuration,
            ILogger logger)
        {
            _moduleContainer = moduleContainer;
            _scriptRunner = scriptRunner;
            _moduleService = moduleService;
            _hostingEnvironment = hostingEnvironment;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> InstallAsync(IModule module)
        {
            if (!module.IsInstalled)
            {
                string script = module.Assembly.GetDbInstallScript();
                var status = await _scriptRunner.Run(new[] { script });
                module.IsInstalled = status;
                if (status)
                {
                    await _moduleService.Save(module);
                    await _moduleService.AddOperationAsync(module.Name, module.Version, ModuleOperationType.Install, ModuleOperationStatus.Succeeded, ModuleLifecycleState.Enabled, ModuleRuntimeState.Loaded, "Built-in module installed.", null, null, -1);
                }
                else
                {
                    await _moduleService.AddOperationAsync(module.Name, module.Version, ModuleOperationType.Install, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.NotLoaded, "Built-in module installation failed.", null, new[] { "Database install script failed." }, -1);
                }
                return status;
            }
            return false;
        }

        public async Task<bool> UnInstallAsync(IModule module)
        {
            if (module.IsInstalled)
            {
                string script = module.Assembly.GetDbUnInstallScript();
                var status = await _scriptRunner.Run(new[] { script });
                module.IsInstalled = false;
                if (status)
                {
                    await _moduleService.AddOperationAsync(module.Name, module.Version, ModuleOperationType.Uninstall, ModuleOperationStatus.Succeeded, ModuleLifecycleState.Uninstalled, ModuleRuntimeState.Stopped, "Built-in module uninstalled.", null, null, -1);
                    return await _moduleService.Uninstall(module.Name);
                }
                await _moduleService.AddOperationAsync(module.Name, module.Version, ModuleOperationType.Uninstall, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, "Built-in module uninstallation failed.", null, new[] { "Database uninstall script failed." }, -1);
                return false;
            }
            return false;
        }

        public async Task<IModule> FindAsync(string moduleName)
        {
            var module = _moduleContainer.Modules.SingleOrDefault(e => e.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
            if (module != null)
                return module;

            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null || string.IsNullOrWhiteSpace(moduleInfo.ActiveVersion))
                return null;

            return TryLoadManifestModule(moduleInfo.ModuleKey ?? moduleInfo.Name, moduleInfo.ActiveVersion);
        }

        public Task<bool> UpdateModule(IModule module)
        {
            _moduleContainer.AddOrUpdate(module);
            return Task.FromResult(true);
        }

        public async Task<ModulePackageValidationResult> UploadPackageAsync(Stream packageStream, string fileName, long userId)
        {
            await _moduleService.EnsureModuleManagementSchemaAsync();
            EnsureModuleDirectories();

            var uploadPath = Path.Combine(GetUploadPath(), $"{DateTime.UtcNow:yyyyMMddHHmmssfff}-{Path.GetFileName(fileName)}");
            using (var file = File.Create(uploadPath))
            {
                await packageStream.CopyToAsync(file);
            }

            var result = await ValidatePackageAsync(uploadPath, true);
            if (!result.IsValid)
            {
                await _moduleService.AddOperationAsync(result.ModuleId, result.Version, ModuleOperationType.Upload, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.NotLoaded, "Module package upload validation failed.", result, result.Errors, userId);
                return result;
            }

            var moduleRoot = GetModuleRoot(result.Manifest.Id);
            var versionPath = GetVersionPath(result.Manifest.Id, result.Manifest.Version);
            if (Directory.Exists(versionPath))
            {
                var existingModule = await _moduleService.GetByNameAsync(result.Manifest.Id);
                var isUninstalled = existingModule != null
                    && string.Equals(existingModule.LifecycleState, ModuleLifecycleState.Uninstalled.ToString(), StringComparison.OrdinalIgnoreCase);

                if (isUninstalled)
                {
                    Directory.Delete(versionPath, true);
                }
                else
                {
                    result.Errors.Add($"Module version already exists: {result.Manifest.Id} {result.Manifest.Version}.");
                    if (Directory.Exists(result.StagingPath))
                    {
                        Directory.Delete(result.StagingPath, true);
                        result.StagingPath = string.Empty;
                    }
                    await _moduleService.AddOperationAsync(result.Manifest.Id, result.Manifest.Version, ModuleOperationType.Upload, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.NotLoaded, "Duplicate module version.", result, result.Errors, userId);
                    return result;
                }
            }

            Directory.CreateDirectory(Path.Combine(moduleRoot, "versions"));
            Directory.CreateDirectory(Path.Combine(moduleRoot, "staging"));
            Directory.Move(result.StagingPath, versionPath);

            result.VersionPath = versionPath;
            result.StagingPath = string.Empty;

            var manifestJson = JsonSerializer.Serialize(result.Manifest, _jsonOptions);
            await _moduleService.SavePackageAsync(result.Manifest, result.PackageHash, versionPath, string.Empty, manifestJson, ModuleLifecycleState.Staged, userId);
            await WriteStateFileAsync(result.Manifest.Id, result.Manifest.Version, ModuleLifecycleState.Staged, ModuleRuntimeState.NotLoaded, string.Empty);
            await _moduleService.AddOperationAsync(result.Manifest.Id, result.Manifest.Version, ModuleOperationType.Upload, ModuleOperationStatus.Succeeded, ModuleLifecycleState.Staged, ModuleRuntimeState.NotLoaded, "Module package uploaded and staged.", result, result.Warnings, userId);

            return result;
        }

        public async Task<ModulePackageValidationResult> ValidatePackageAsync(string packagePath)
        {
            return await ValidatePackageAsync(packagePath, false);
        }

        private async Task<ModulePackageValidationResult> ValidatePackageAsync(string packagePath, bool preserveStagingPath)
        {
            var result = new ModulePackageValidationResult();
            if (string.IsNullOrWhiteSpace(packagePath) || !File.Exists(packagePath))
            {
                result.Errors.Add("Module package file was not found.");
                return result;
            }

            result.PackageHash = await ComputeFileHashAsync(packagePath);
            var stagingPath = Path.Combine(GetTempStagingPath(), Path.GetFileNameWithoutExtension(packagePath) + "-" + Guid.NewGuid().ToString("N"));
            result.StagingPath = stagingPath;

            try
            {
                ValidateZipEntries(packagePath, result);
                if (!result.IsValid)
                    return result;

                Directory.CreateDirectory(stagingPath);
                ZipFile.ExtractToDirectory(packagePath, stagingPath);
                RemoveDepsJsonFiles(stagingPath);
                await ValidateExtractedPackageAsync(stagingPath, result);
                return result;
            }
            catch (InvalidDataException ex)
            {
                result.Errors.Add("Invalid module package ZIP: " + ex.Message);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => ex.Message, ex);
                result.Errors.Add(ex.Message);
                return result;
            }
            finally
            {
                if ((!result.IsValid || !preserveStagingPath) && Directory.Exists(stagingPath))
                {
                    Directory.Delete(stagingPath, true);
                    result.StagingPath = string.Empty;
                }
            }
        }

        public async Task<ModuleOperationResult> InstallPackageAsync(string moduleName, string version, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Module was not found.");

            version = string.IsNullOrWhiteSpace(version) ? moduleInfo.StagedVersion ?? moduleInfo.Version : version;
            var versionPath = GetVersionPath(moduleInfo.ModuleKey ?? moduleInfo.Name, version);
            var manifest = ReadManifest(versionPath);
            if (manifest == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Module manifest was not found.");

            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.PendingInstall, ModuleRuntimeState.NotLoaded, ModuleOperationType.Install.ToString(), null, manifest.RestartRequired, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Install, ModuleOperationStatus.Started, ModuleLifecycleState.PendingInstall, ModuleRuntimeState.NotLoaded, "Module installation pending.", manifest, null, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Installing, ModuleRuntimeState.NotLoaded, ModuleOperationType.Install.ToString(), null, manifest.RestartRequired, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Install, ModuleOperationStatus.Started, ModuleLifecycleState.Installing, ModuleRuntimeState.NotLoaded, "Module installation started.", manifest, null, userId);

            var migrationResult = await RunMigrationsAsync(manifest.Id, version, versionPath, "install", userId);
            if (!migrationResult.Succeeded)
            {
                await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, ModuleOperationType.Install.ToString(), migrationResult.Message, false, userId);
                await WriteStateFileAsync(manifest.Id, version, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, migrationResult.Message);
                await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Install, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, migrationResult.Message, manifest, migrationResult.Errors, userId);
                return migrationResult;
            }

            await WriteActiveVersionAsync(manifest.Id, version, userId);
            var loaded = false;
            try { loaded = TryLoadManifestModule(manifest.Id, version) != null; }
            catch { loaded = false; }
            var runtimeState = loaded ? ModuleRuntimeState.Loaded : ModuleRuntimeState.NotLoaded;
            var requiresRestart = manifest.RestartRequired || !loaded;

            await _moduleService.SetActiveVersionAsync(manifest.Id, version, versionPath, userId);
            await _moduleService.SyncManifestRegistrationAsync(manifest, moduleInfo.PackageHash, versionPath, JsonSerializer.Serialize(manifest, _jsonOptions), ModuleLifecycleState.Enabled, true, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Enabled, runtimeState, ModuleOperationType.Install.ToString(), null, requiresRestart, userId);
            await WriteStateFileAsync(manifest.Id, version, ModuleLifecycleState.Enabled, runtimeState, string.Empty);

            var message = requiresRestart
                ? "Module installed. Restart the CMS to activate API controllers and services."
                : "Module installed and loaded.";
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Install, requiresRestart ? ModuleOperationStatus.RequiresRestart : ModuleOperationStatus.Succeeded, ModuleLifecycleState.Enabled, runtimeState, message, manifest, migrationResult.Warnings, userId);
            return ModuleOperationResult.Success(manifest.Id, version, ModuleLifecycleState.Enabled, message, requiresRestart);
        }

        public async Task<ModuleOperationResult> EnableAsync(string moduleName, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Module was not found.");

            var version = moduleInfo.ActiveVersion ?? moduleInfo.Version;
            var manifest = ReadManifest(GetVersionPath(moduleInfo.ModuleKey ?? moduleInfo.Name, version));
            if (manifest != null)
            {
                await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.PendingEnable, ModuleRuntimeState.NotLoaded, ModuleOperationType.Enable.ToString(), null, true, userId);
            }

            bool loaded;
            try { loaded = TryLoadManifestModule(moduleInfo.ModuleKey ?? moduleInfo.Name, version) != null; }
            catch { loaded = false; }
            loaded = loaded || _moduleContainer.Modules.Any(x => x.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
            var runtimeState = loaded ? ModuleRuntimeState.Loaded : ModuleRuntimeState.NotLoaded;
            var requiresRestart = !loaded;

            var module = _moduleContainer.Modules.FirstOrDefault(x => x.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
            if (module != null)
                module.IsInstalled = true;

            if (manifest != null)
                await _moduleService.SyncManifestRegistrationAsync(manifest, moduleInfo.PackageHash, GetVersionPath(manifest.Id, version), JsonSerializer.Serialize(manifest, _jsonOptions), ModuleLifecycleState.Enabled, true, userId);

            await _moduleService.UpdateStateAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Enabled, runtimeState, ModuleOperationType.Enable.ToString(), null, requiresRestart, userId);
            await WriteStateFileAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Enabled, runtimeState, string.Empty);
            await _moduleService.AddOperationAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleOperationType.Enable, requiresRestart ? ModuleOperationStatus.RequiresRestart : ModuleOperationStatus.Succeeded, ModuleLifecycleState.Enabled, runtimeState, "Module enabled.", null, null, userId);

            return ModuleOperationResult.Success(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Enabled, requiresRestart ? "Module enabled. Restart required to load backend endpoints." : "Module enabled.", requiresRestart);
        }

        public async Task<ModuleOperationResult> DisableAsync(string moduleName, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Module was not found.");

            var version = moduleInfo.ActiveVersion ?? moduleInfo.Version;
            var module = _moduleContainer.Modules.FirstOrDefault(x => x.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
            if (module != null)
                module.IsInstalled = false;

            await _moduleService.UpdateStateAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.PendingDisable, ModuleRuntimeState.Stopping, ModuleOperationType.Disable.ToString(), null, false, userId);
            await _moduleService.DeactivateManifestRegistrationAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, userId);
            await _moduleService.UpdateStateAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Disabled, ModuleRuntimeState.Stopped, ModuleOperationType.Disable.ToString(), null, false, userId);
            await WriteStateFileAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Disabled, ModuleRuntimeState.Stopped, string.Empty);
            await _moduleService.AddOperationAsync(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleOperationType.Disable, ModuleOperationStatus.Succeeded, ModuleLifecycleState.Disabled, ModuleRuntimeState.Stopped, "Module disabled.", null, null, userId);
            return ModuleOperationResult.Success(moduleInfo.ModuleKey ?? moduleInfo.Name, version, ModuleLifecycleState.Disabled, "Module disabled.");
        }

        public async Task<ModuleOperationResult> PingAsync(string moduleName)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Module was not found.");

            if (!string.Equals(moduleInfo.LifecycleState, "Enabled", StringComparison.OrdinalIgnoreCase))
            {
                var reason = string.Equals(moduleInfo.LifecycleState, "Disabled", StringComparison.OrdinalIgnoreCase)
                    || string.Equals(moduleInfo.LifecycleState, "InstalledDisabled", StringComparison.OrdinalIgnoreCase)
                    ? "Module is disabled."
                    : $"Module is not enabled (state: {moduleInfo.LifecycleState}).";
                return ModuleOperationResult.Fail(moduleName, moduleInfo.Version, ModuleLifecycleState.Failed, reason);
            }

            var module = _moduleContainer.Modules.FirstOrDefault(x => x.Name.Equals(moduleName, StringComparison.OrdinalIgnoreCase));
            if (module == null)
                return ModuleOperationResult.Fail(moduleName, moduleInfo.Version, ModuleLifecycleState.Failed, "Module assembly is not registered in the container.");

            if (module.Assembly == null)
                return ModuleOperationResult.Fail(moduleName, module.Version, ModuleLifecycleState.Failed, "Module assembly is not loaded.");

            if (!string.Equals(moduleInfo.RuntimeState, "Loaded", StringComparison.OrdinalIgnoreCase))
                await _moduleService.UpdateStateAsync(moduleName, module.Version, ModuleLifecycleState.Enabled, ModuleRuntimeState.Loaded, "Ping", null, false, 0);

            return ModuleOperationResult.Success(moduleName, module.Version, ModuleLifecycleState.Enabled, "Module is healthy.");
        }

        public async Task<ModuleOperationResult> UpgradeAsync(string moduleName, string version, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Module was not found.");

            if (string.IsNullOrWhiteSpace(version))
                version = moduleInfo.StagedVersion;

            if (string.IsNullOrWhiteSpace(version))
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Target version is required.");

            var versionPath = GetVersionPath(moduleInfo.ModuleKey ?? moduleInfo.Name, version);
            var manifest = ReadManifest(versionPath);
            if (manifest == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Target module version was not found.");

            if (!HasRequiredMigrationRoute(versionPath, "upgrade", moduleInfo.ActiveVersion, version))
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.UpgradeFailed, $"Upgrade migration path is missing: {moduleInfo.ActiveVersion}_to_{version}.");

            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.PendingUpgrade, ModuleRuntimeState.NotLoaded, ModuleOperationType.Upgrade.ToString(), null, manifest.RestartRequired, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Upgrade, ModuleOperationStatus.Started, ModuleLifecycleState.PendingUpgrade, ModuleRuntimeState.NotLoaded, "Module upgrade pending.", manifest, null, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Upgrading, ModuleRuntimeState.NotLoaded, ModuleOperationType.Upgrade.ToString(), null, manifest.RestartRequired, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Upgrade, ModuleOperationStatus.Started, ModuleLifecycleState.Upgrading, ModuleRuntimeState.NotLoaded, "Module upgrade started.", manifest, null, userId);
            var upgradeResult = await RunMigrationsAsync(manifest.Id, version, versionPath, "upgrade", userId, moduleInfo.ActiveVersion, version);
            if (!upgradeResult.Succeeded)
            {
                await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.UpgradeFailed, ModuleRuntimeState.Faulted, ModuleOperationType.Upgrade.ToString(), upgradeResult.Message, false, userId);
                await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Upgrade, ModuleOperationStatus.Failed, ModuleLifecycleState.UpgradeFailed, ModuleRuntimeState.Faulted, upgradeResult.Message, manifest, upgradeResult.Errors, userId);
                return upgradeResult;
            }

            await WriteActiveVersionAsync(manifest.Id, version, userId);
            bool loaded;
            try { loaded = TryLoadManifestModule(manifest.Id, version) != null; }
            catch { loaded = false; }
            var runtimeState = loaded ? ModuleRuntimeState.Loaded : ModuleRuntimeState.NotLoaded;
            var requiresRestart = manifest.RestartRequired || !loaded;
            await _moduleService.SetActiveVersionAsync(manifest.Id, version, versionPath, userId);
            await _moduleService.SyncManifestRegistrationAsync(manifest, moduleInfo.PackageHash, versionPath, JsonSerializer.Serialize(manifest, _jsonOptions), ModuleLifecycleState.Enabled, true, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Enabled, runtimeState, ModuleOperationType.Upgrade.ToString(), null, requiresRestart, userId);
            await WriteStateFileAsync(manifest.Id, version, ModuleLifecycleState.Enabled, runtimeState, string.Empty);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Upgrade, requiresRestart ? ModuleOperationStatus.RequiresRestart : ModuleOperationStatus.Succeeded, ModuleLifecycleState.Enabled, runtimeState, "Module upgraded.", manifest, upgradeResult.Warnings, userId);

            return ModuleOperationResult.Success(manifest.Id, version, ModuleLifecycleState.Enabled, requiresRestart ? "Module upgraded. Restart required to activate backend changes." : "Module upgraded.", requiresRestart);
        }

        public async Task<ModuleOperationResult> RollbackAsync(string moduleName, string version, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Module was not found.");

            if (string.IsNullOrWhiteSpace(version))
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Rollback version is required.");

            var versionPath = GetVersionPath(moduleInfo.ModuleKey ?? moduleInfo.Name, version);
            var manifest = ReadManifest(versionPath);
            if (manifest == null)
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, "Rollback target version was not found.");

            if (!HasRequiredMigrationRoute(versionPath, "rollback", moduleInfo.ActiveVersion, version))
                return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, $"Rollback migration path is missing: {moduleInfo.ActiveVersion}_to_{version}.");

            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.PendingRollback, ModuleRuntimeState.NotLoaded, ModuleOperationType.Rollback.ToString(), null, true, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Rollback, ModuleOperationStatus.Started, ModuleLifecycleState.PendingRollback, ModuleRuntimeState.NotLoaded, "Module rollback pending.", manifest, null, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.RollingBack, ModuleRuntimeState.NotLoaded, ModuleOperationType.Rollback.ToString(), null, true, userId);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Rollback, ModuleOperationStatus.Started, ModuleLifecycleState.RollingBack, ModuleRuntimeState.NotLoaded, "Module rollback started.", manifest, null, userId);
            var rollbackResult = await RunMigrationsAsync(manifest.Id, version, versionPath, "rollback", userId, moduleInfo.ActiveVersion, version);
            if (!rollbackResult.Succeeded)
            {
                await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, ModuleOperationType.Rollback.ToString(), rollbackResult.Message, false, userId);
                await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Rollback, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, rollbackResult.Message, manifest, rollbackResult.Errors, userId);
                return rollbackResult;
            }

            await WriteActiveVersionAsync(manifest.Id, version, userId);
            await _moduleService.SetActiveVersionAsync(manifest.Id, version, versionPath, userId);
            await _moduleService.SyncManifestRegistrationAsync(manifest, moduleInfo.PackageHash, versionPath, JsonSerializer.Serialize(manifest, _jsonOptions), ModuleLifecycleState.Enabled, true, userId);
            await _moduleService.UpdateStateAsync(manifest.Id, version, ModuleLifecycleState.Enabled, ModuleRuntimeState.NotLoaded, ModuleOperationType.Rollback.ToString(), null, true, userId);
            await WriteStateFileAsync(manifest.Id, version, ModuleLifecycleState.Enabled, ModuleRuntimeState.NotLoaded, string.Empty);
            await _moduleService.AddOperationAsync(manifest.Id, version, ModuleOperationType.Rollback, ModuleOperationStatus.RequiresRestart, ModuleLifecycleState.Enabled, ModuleRuntimeState.NotLoaded, "Module rolled back. Restart required to activate backend changes.", manifest, rollbackResult.Warnings, userId);

            return ModuleOperationResult.Success(manifest.Id, version, ModuleLifecycleState.Enabled, "Module rolled back. Restart required to activate backend changes.", true);
        }

        public async Task<ModuleOperationResult> UninstallPackageAsync(string moduleName, bool purgeData, long userId)
        {
            var moduleInfo = await _moduleService.GetByNameAsync(moduleName);
            if (moduleInfo == null)
                return ModuleOperationResult.Fail(moduleName, string.Empty, ModuleLifecycleState.Failed, "Module was not found.");

            var moduleKey = moduleInfo.ModuleKey ?? moduleInfo.Name;
            var version = moduleInfo.ActiveVersion ?? moduleInfo.Version;
            var versionPath = GetVersionPath(moduleKey, version);
            var manifest = ReadManifest(versionPath);

            await _moduleService.UpdateStateAsync(moduleKey, version, ModuleLifecycleState.PendingUninstall, ModuleRuntimeState.Stopping, ModuleOperationType.Uninstall.ToString(), null, false, userId);
            await _moduleService.AddOperationAsync(moduleKey, version, ModuleOperationType.Uninstall, ModuleOperationStatus.Started, ModuleLifecycleState.PendingUninstall, ModuleRuntimeState.Stopping, "Module uninstall pending.", manifest, null, userId);
            await _moduleService.UpdateStateAsync(moduleKey, version, ModuleLifecycleState.Uninstalling, ModuleRuntimeState.Stopping, ModuleOperationType.Uninstall.ToString(), null, false, userId);
            await _moduleService.AddOperationAsync(moduleKey, version, ModuleOperationType.Uninstall, ModuleOperationStatus.Started, ModuleLifecycleState.Uninstalling, ModuleRuntimeState.Stopping, "Module uninstall started.", manifest, null, userId);
            if (purgeData && manifest != null)
            {
                var uninstallResult = await RunMigrationsAsync(moduleKey, version, versionPath, "uninstall", userId);
                if (!uninstallResult.Succeeded)
                {
                    await _moduleService.UpdateStateAsync(moduleKey, version, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, ModuleOperationType.Uninstall.ToString(), uninstallResult.Message, false, userId);
                    await _moduleService.AddOperationAsync(moduleKey, version, ModuleOperationType.Uninstall, ModuleOperationStatus.Failed, ModuleLifecycleState.Failed, ModuleRuntimeState.Faulted, uninstallResult.Message, manifest, uninstallResult.Errors, userId);
                    return uninstallResult;
                }
            }

            var module = _moduleContainer.Modules.FirstOrDefault(x => x.Name.Equals(moduleKey, StringComparison.OrdinalIgnoreCase));
            if (module != null)
                module.IsInstalled = false;

            await _moduleService.Uninstall(moduleKey);
            await _moduleService.DeactivateManifestRegistrationAsync(moduleKey, version, userId);
            await WriteStateFileAsync(moduleKey, version, ModuleLifecycleState.Uninstalled, ModuleRuntimeState.Stopped, string.Empty);
            await _moduleService.AddOperationAsync(moduleKey, version, ModuleOperationType.Uninstall, ModuleOperationStatus.Succeeded, ModuleLifecycleState.Uninstalled, ModuleRuntimeState.Stopped, purgeData ? "Module uninstalled and data purge scripts completed." : "Module uninstalled without purging data.", manifest, null, userId);
            return ModuleOperationResult.Success(moduleKey, version, ModuleLifecycleState.Uninstalled, purgeData ? "Module uninstalled and data purge scripts completed." : "Module uninstalled without purging data.");
        }

        public Task<IEnumerable<ModuleOperationJournal>> GetOperationJournalAsync(string moduleName, int count = 50)
        {
            return _moduleService.GetOperationJournalAsync(moduleName, count);
        }

        internal IEnumerable<ManifestModule> LoadActivePackageModules()
        {
            EnsureModuleDirectories();
            var modules = new List<ManifestModule>();
            foreach (var moduleDirectory in Directory.GetDirectories(GetModulesPath()))
            {
                if (Path.GetFileName(moduleDirectory).StartsWith("_", StringComparison.Ordinal))
                    continue;

                var activeVersionPath = Path.Combine(moduleDirectory, "active-version.json");
                if (!File.Exists(activeVersionPath))
                    continue;

                try
                {
                    var pointer = JsonSerializer.Deserialize<ModuleVersionPointer>(File.ReadAllText(activeVersionPath), _jsonOptions);
                    if (pointer == null || string.IsNullOrWhiteSpace(pointer.Version))
                        continue;

                    var module = TryLoadManifestModule(pointer.ModuleId, pointer.Version);
                    if (module != null)
                        modules.Add(module);
                }
                catch (Exception ex)
                {
                    _logger.Log(LogType.Error, () => $"Failed to load package module from {moduleDirectory}.", ex);
                }
            }

            return modules;
        }

        private async Task ValidateExtractedPackageAsync(string stagingPath, ModulePackageValidationResult result)
        {
            var manifestPath = Path.Combine(stagingPath, "module.json");
            if (!File.Exists(manifestPath))
            {
                result.Errors.Add("module.json is required at package root.");
                return;
            }

            var manifestJson = await File.ReadAllTextAsync(manifestPath);
            var manifest = JsonSerializer.Deserialize<ModuleManifest>(manifestJson, _jsonOptions);
            if (manifest == null)
            {
                result.Errors.Add("module.json could not be parsed.");
                return;
            }
            NormalizeManifest(manifest);

            result.Manifest = manifest;
            result.ModuleId = manifest.Id;
            result.Version = manifest.Version;

            ValidateManifest(manifest, result);
            await ValidateDependenciesAsync(manifest, result);
            await ValidateConflictsAsync(manifest, result);
            ValidatePackageFiles(stagingPath, manifest, result);
        }

        private void ValidateManifest(ModuleManifest manifest, ModulePackageValidationResult result)
        {
            if (string.IsNullOrWhiteSpace(manifest.Id) || !ModuleIdPattern.IsMatch(manifest.Id))
                result.Errors.Add("Manifest Id is required and may contain only letters, numbers, '.', '_' and '-'.");

            if (string.IsNullOrWhiteSpace(manifest.Version) || !IsValidModuleVersion(manifest.Version))
                result.Errors.Add("Manifest Version is required and must be a valid version.");

            if (string.IsNullOrWhiteSpace(manifest.EntryAssembly))
                result.Errors.Add("Manifest EntryAssembly is required.");

            if (!string.IsNullOrWhiteSpace(manifest.ApiRoutePrefix))
            {
                var route = manifest.ApiRoutePrefix.Trim().Trim('/');
                if (!route.StartsWith("api/modules/", StringComparison.OrdinalIgnoreCase))
                    result.Errors.Add("Manifest ApiRoutePrefix must use the reserved /api/modules/{module-id}/ namespace.");
            }

            if (manifest.Dependencies.Any(x => !string.IsNullOrWhiteSpace(x.ModuleId) && x.ModuleId.Equals(manifest.Id, StringComparison.OrdinalIgnoreCase)))
                result.Errors.Add("Module dependency graph cannot reference itself.");

            var cmsVersion = _configuration["YangOneAppConfig:Version"];
            if (!string.IsNullOrWhiteSpace(cmsVersion))
            {
                if (!string.IsNullOrWhiteSpace(manifest.CmsMinimumVersion) && Version.TryParse(cmsVersion, out var current) && Version.TryParse(manifest.CmsMinimumVersion, out var minimum) && current < minimum)
                    result.Errors.Add($"CMS version {cmsVersion} is lower than required module minimum {manifest.CmsMinimumVersion}.");

                if (!string.IsNullOrWhiteSpace(manifest.CmsMaximumVersion) && Version.TryParse(cmsVersion, out current) && Version.TryParse(manifest.CmsMaximumVersion, out var maximum) && current > maximum)
                    result.Errors.Add($"CMS version {cmsVersion} is higher than supported module maximum {manifest.CmsMaximumVersion}.");
            }

            if (manifest.DatabaseProviders.Count > 0 &&
                !manifest.DatabaseProviders.Any(x => x.Equals("SQLServer", StringComparison.OrdinalIgnoreCase) || x.Equals("mssql", StringComparison.OrdinalIgnoreCase)))
                result.Errors.Add("Module does not declare support for SQLServer/mssql database provider.");

            if (!string.IsNullOrWhiteSpace(manifest.PackageHash) && !HashEquals(manifest.PackageHash, result.PackageHash))
                result.Errors.Add("Manifest PackageHash does not match the uploaded package hash.");

            var requireSignature = _configuration.GetValue<bool>("ModuleManagement:RequireDigitalSignature");
            if (requireSignature && string.IsNullOrWhiteSpace(manifest.DigitalSignature))
                result.Errors.Add("Digital signature is required by configuration.");
            else if (string.IsNullOrWhiteSpace(manifest.DigitalSignature))
                result.Warnings.Add("Digital signature was not provided.");
        }

        private async Task ValidateDependenciesAsync(ModuleManifest manifest, ModulePackageValidationResult result)
        {
            foreach (var dependency in manifest.Dependencies.Where(x => x.Required))
            {
                if (string.IsNullOrWhiteSpace(dependency.ModuleId))
                {
                    result.Errors.Add("Required dependency ModuleId is missing.");
                    continue;
                }

                var installed = await _moduleService.GetByNameAsync(dependency.ModuleId);
                if (installed == null || !installed.IsInstalled)
                {
                    result.Errors.Add($"Missing required module dependency: {dependency.ModuleId}.");
                    continue;
                }

                if (!string.IsNullOrWhiteSpace(dependency.MinimumVersion) &&
                    Version.TryParse(installed.ActiveVersion ?? installed.Version, out var installedVersion) &&
                    Version.TryParse(dependency.MinimumVersion, out var minimumVersion) &&
                    installedVersion < minimumVersion)
                {
                    result.Errors.Add($"Dependency {dependency.ModuleId} must be at least {dependency.MinimumVersion}.");
                }
            }

            foreach (var dependency in manifest.Dependencies.Where(x => !string.IsNullOrWhiteSpace(x.ModuleId)))
            {
                if (await HasDependencyPathToModuleAsync(dependency.ModuleId, manifest.Id, new HashSet<string>(StringComparer.OrdinalIgnoreCase)))
                    result.Errors.Add($"Circular module dependency detected between {manifest.Id} and {dependency.ModuleId}.");
            }
        }

        private async Task<bool> HasDependencyPathToModuleAsync(string currentModuleId, string targetModuleId, HashSet<string> visited)
        {
            if (!visited.Add(currentModuleId))
                return false;

            var module = await _moduleService.GetByNameAsync(currentModuleId);
            if (module == null || string.IsNullOrWhiteSpace(module.ManifestJson))
                return false;

            ModuleManifest manifest;
            try
            {
                manifest = JsonSerializer.Deserialize<ModuleManifest>(module.ManifestJson, _jsonOptions);
            }
            catch
            {
                return false;
            }

            if (manifest == null)
                return false;

            NormalizeManifest(manifest);
            foreach (var dependency in manifest.Dependencies.Where(x => !string.IsNullOrWhiteSpace(x.ModuleId)))
            {
                if (dependency.ModuleId.Equals(targetModuleId, StringComparison.OrdinalIgnoreCase))
                    return true;

                if (await HasDependencyPathToModuleAsync(dependency.ModuleId, targetModuleId, visited))
                    return true;
            }

            return false;
        }

        private async Task ValidateConflictsAsync(ModuleManifest manifest, ModulePackageValidationResult result)
        {
            var modules = await _moduleService.GetAllAsync();
            foreach (var module in modules.Where(x => !string.Equals(x.ModuleKey ?? x.Name, manifest.Id, StringComparison.OrdinalIgnoreCase)))
            {
                if (string.IsNullOrWhiteSpace(module.ManifestJson))
                    continue;

                try
                {
                    var existing = JsonSerializer.Deserialize<ModuleManifest>(module.ManifestJson, _jsonOptions);
                    if (existing == null)
                        continue;
                    NormalizeManifest(existing);

                    if (!string.IsNullOrWhiteSpace(manifest.ApiRoutePrefix) &&
                        manifest.ApiRoutePrefix.Equals(existing.ApiRoutePrefix, StringComparison.OrdinalIgnoreCase))
                        result.Errors.Add($"API route prefix conflicts with module {existing.Id}: {manifest.ApiRoutePrefix}.");

                    var duplicateMenu = manifest.Menus.Select(x => x.Key).Where(x => !string.IsNullOrWhiteSpace(x))
                        .Intersect(existing.Menus.Select(x => x.Key), StringComparer.OrdinalIgnoreCase)
                        .FirstOrDefault();
                    if (!string.IsNullOrWhiteSpace(duplicateMenu))
                        result.Errors.Add($"Menu key conflicts with module {existing.Id}: {duplicateMenu}.");
                }
                catch
                {
                    result.Warnings.Add($"Could not inspect existing manifest for module {module.Name}.");
                }
            }
        }

        private void ValidatePackageFiles(string stagingPath, ModuleManifest manifest, ModulePackageValidationResult result)
        {
            var backendPath = Path.Combine(stagingPath, "backend");
            var entryAssemblyPath = Path.Combine(backendPath, manifest.EntryAssembly);
            if (!File.Exists(entryAssemblyPath))
                result.Errors.Add($"Entry assembly was not found: backend/{manifest.EntryAssembly}.");

            foreach (var migration in manifest.Migrations)
            {
                if (string.IsNullOrWhiteSpace(migration.Path))
                    continue;

                if (IsEmbeddedMigrationReference(migration.Path))
                    continue;

                var path = Path.Combine(stagingPath, migration.Path.Replace('/', Path.DirectorySeparatorChar));
                if (!File.Exists(path) && !Directory.Exists(path))
                    result.Errors.Add($"Declared migration path was not found: {migration.Path}.");
            }
        }

        private void ValidateZipEntries(string packagePath, ModulePackageValidationResult result)
        {
            using (var archive = ZipFile.OpenRead(packagePath))
            {
                foreach (var entry in archive.Entries)
                {
                    if (string.IsNullOrWhiteSpace(entry.FullName))
                        continue;

                    var normalized = entry.FullName.Replace('\\', '/');
                    if (Path.IsPathRooted(normalized) || normalized.StartsWith("/", StringComparison.Ordinal) || normalized.Contains("../", StringComparison.Ordinal) || normalized.Contains("..\\", StringComparison.Ordinal))
                        result.Errors.Add($"Package contains unsafe path: {entry.FullName}.");

                    var extension = Path.GetExtension(normalized);
                    if (ForbiddenExtensions.Contains(extension))
                        result.Errors.Add($"Package contains forbidden file extension: {entry.FullName}.");
                }
            }
        }

        private async Task<ModuleOperationResult> RunMigrationsAsync(string moduleName, string version, string versionPath, string migrationType, long userId, string fromVersion = null, string toVersion = null)
        {
            var scripts = GetMigrationScripts(versionPath, migrationType, fromVersion, toVersion).ToList();
            if (scripts.Count == 0)
            {
                return ModuleOperationResult.Success(moduleName, version, ModuleLifecycleState.Enabled, $"No {migrationType} migrations found.");
            }

            foreach (var migrationScript in scripts)
            {
                var hash = ComputeTextHash(migrationScript.Sql);
                if (ShouldSkipAppliedMigration(migrationType) && await _moduleService.HasMigrationAsync(moduleName, version, hash))
                    continue;

                var ok = await _scriptRunner.Run(new[] { migrationScript.Sql });
                await _moduleService.RecordMigrationAsync(moduleName, version, migrationScript.Name, migrationType, migrationScript.Source, hash, ok, ok ? string.Empty : "Migration script failed.", userId);
                if (!ok)
                    return ModuleOperationResult.Fail(moduleName, version, ModuleLifecycleState.Failed, $"{migrationType} migration failed: {migrationScript.Name}.");
            }

            return ModuleOperationResult.Success(moduleName, version, ModuleLifecycleState.Enabled, $"{migrationType} migrations completed.");
        }

        private IEnumerable<ModuleMigrationScript> GetMigrationScripts(string versionPath, string migrationType, string fromVersion, string toVersion)
        {
            var manifest = ReadManifest(versionPath);
            if (manifest != null)
            {
                var embeddedScripts = GetEmbeddedMigrationScripts(versionPath, manifest, migrationType, fromVersion, toVersion).ToList();
                if (embeddedScripts.Count > 0)
                    return embeddedScripts;
            }

            return GetPhysicalMigrationScripts(versionPath, migrationType, fromVersion, toVersion);
        }

        private IEnumerable<ModuleMigrationScript> GetPhysicalMigrationScripts(string versionPath, string migrationType, string fromVersion, string toVersion)
        {
            var databasePath = Path.Combine(versionPath, "database", migrationType);
            if (!Directory.Exists(databasePath))
                return Enumerable.Empty<ModuleMigrationScript>();

            if (!string.IsNullOrWhiteSpace(fromVersion) && !string.IsNullOrWhiteSpace(toVersion))
            {
                var versionSpecific = Path.Combine(databasePath, $"{fromVersion}_to_{toVersion}");
                if (Directory.Exists(versionSpecific))
                    databasePath = versionSpecific;
            }

            return Directory.GetFiles(databasePath, "*.sql", SearchOption.AllDirectories)
                .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
                .Select(x => new ModuleMigrationScript(Path.GetFileName(x), x, File.ReadAllText(x)));
        }

        private IEnumerable<ModuleMigrationScript> GetEmbeddedMigrationScripts(string versionPath, ModuleManifest manifest, string migrationType, string fromVersion, string toVersion)
        {
            var scripts = new List<ModuleMigrationScript>();
            AssemblyLoadContext inspectionContext = null;
            try
            {
                var assembly = LoadModuleAssemblyForInspection(versionPath, manifest, out inspectionContext);
                var resources = GetMatchingEmbeddedMigrationResources(assembly, migrationType, fromVersion, toVersion).ToList();
                foreach (var resource in resources)
                {
                    using var stream = assembly.GetManifestResourceStream(resource);
                    if (stream == null)
                        continue;

                    using var reader = new StreamReader(stream);
                    scripts.Add(new ModuleMigrationScript(GetEmbeddedMigrationName(assembly, migrationType, resource), $"embedded:{resource}", reader.ReadToEnd()));
                }
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => $"Failed to load embedded {migrationType} migrations for {manifest.Id} {manifest.Version}.", ex);
            }
            finally
            {
                inspectionContext?.Unload();
            }

            return scripts;
        }

        private IEnumerable<string> GetMatchingEmbeddedMigrationResources(Assembly assembly, string migrationType, string fromVersion, string toVersion)
        {
            var assemblyName = assembly.GetName().Name;
            var migrationToken = migrationType.ToLowerInvariant();
            var resourcePrefix = $"{assemblyName}.db.mssql.{migrationToken}.";
            var resources = assembly.GetManifestResourceNames()
                .Where(x => x.StartsWith(resourcePrefix, StringComparison.OrdinalIgnoreCase) && x.EndsWith(".sql", StringComparison.OrdinalIgnoreCase))
                .OrderBy(x => x, StringComparer.OrdinalIgnoreCase)
                .ToList();

            if (string.IsNullOrWhiteSpace(fromVersion) || string.IsNullOrWhiteSpace(toVersion))
                return resources;

            var routeTokens = GetEmbeddedRouteTokens(fromVersion, toVersion).ToList();
            var routeSpecific = resources
                .Where(x => routeTokens.Any(route => x.Contains(route, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (routeSpecific.Count > 0)
                return routeSpecific;

            return resources.Where(x => !x.Contains("_to_", StringComparison.OrdinalIgnoreCase));
        }

        private bool HasRequiredMigrationRoute(string versionPath, string migrationType, string fromVersion, string toVersion)
        {
            var databasePath = Path.Combine(versionPath, "database", migrationType);
            if (!Directory.Exists(databasePath) || string.IsNullOrWhiteSpace(fromVersion) || string.IsNullOrWhiteSpace(toVersion))
                return true;

            if (Directory.Exists(Path.Combine(databasePath, $"{fromVersion}_to_{toVersion}")))
                return true;

            var manifest = ReadManifest(versionPath);
            if (manifest == null)
                return false;

            try
            {
                AssemblyLoadContext inspectionContext = null;
                try
                {
                    var assembly = LoadModuleAssemblyForInspection(versionPath, manifest, out inspectionContext);
                    return GetMatchingEmbeddedMigrationResources(assembly, migrationType, fromVersion, toVersion)
                        .Any(x => GetEmbeddedRouteTokens(fromVersion, toVersion).Any(route => x.Contains(route, StringComparison.OrdinalIgnoreCase)));
                }
                finally
                {
                    inspectionContext?.Unload();
                }
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => $"Failed to inspect embedded {migrationType} migrations for {manifest.Id} {manifest.Version}.", ex);
                return false;
            }
        }

        private ManifestModule TryLoadManifestModule(string moduleId, string version)
        {
            try
            {
                var versionPath = GetVersionPath(moduleId, version);
                var manifest = ReadManifest(versionPath);
                if (manifest == null)
                    return null;

                var entryAssemblyPath = GetEntryAssemblyPath(versionPath, manifest);
                if (HasLoadedDifferentVersionOfAssembly(entryAssemblyPath))
                    return null;

                var assembly = LoadModuleAssembly(versionPath, manifest);
                var instance = assembly.ExportedTypes
                    .Where(t => typeof(IModule).IsAssignableFrom(t) && t.GetConstructor(Type.EmptyTypes) != null)
                    .Select(t => (IModule)Activator.CreateInstance(t))
                    .FirstOrDefault();

                ManifestModule module;
                if (instance != null)
                {
                    instance.IsInstalled = true;
                    instance.Assembly = assembly;
                    module = new ManifestModule(manifest, assembly, GetModuleRoot(moduleId), versionPath)
                    {
                        IsInstalled = true,
                        RequireSettingComponent = instance.RequireSettingComponent,
                        ModuleSettingComponent = instance.ModuleSettingComponent,
                        SupportedVersions = instance.SupportedVersions
                    };
                }
                else
                {
                    module = new ManifestModule(manifest, assembly, GetModuleRoot(moduleId), versionPath)
                    {
                        IsInstalled = true
                    };
                }

                _moduleContainer.AddOrUpdate(module);
                return module;
            }
            catch (Exception ex)
            {
                _logger.Log(LogType.Error, () => $"Failed to load module {moduleId} {version}.", ex);
                return null;
            }
        }

        private Assembly LoadModuleAssembly(string versionPath, ModuleManifest manifest)
        {
            var backendPath = Path.Combine(versionPath, "backend");
            var entryAssemblyPath = GetEntryAssemblyPath(versionPath, manifest);
            if (!File.Exists(entryAssemblyPath))
                throw new FileNotFoundException($"Entry assembly was not found: backend/{manifest.EntryAssembly}.", entryAssemblyPath);

            RemoveDepsJsonFiles(versionPath);

            var dependenciesPath = Path.Combine(backendPath, "dependencies");
            if (Directory.Exists(dependenciesPath))
            {
                foreach (var dependency in Directory.GetFiles(dependenciesPath, "*.dll", SearchOption.TopDirectoryOnly))
                    LoadAssemblyIfNeeded(dependency);
            }

            return LoadAssemblyIfNeeded(entryAssemblyPath);
        }

        private Assembly LoadModuleAssemblyForInspection(string versionPath, ModuleManifest manifest, out AssemblyLoadContext loadContext)
        {
            var entryAssemblyPath = GetEntryAssemblyPath(versionPath, manifest);
            if (!File.Exists(entryAssemblyPath))
                throw new FileNotFoundException($"Entry assembly was not found: backend/{manifest.EntryAssembly}.", entryAssemblyPath);

            loadContext = new AssemblyLoadContext($"module-migration:{manifest.Id}:{manifest.Version}:{Guid.NewGuid():N}", true);
            return loadContext.LoadFromAssemblyPath(entryAssemblyPath);
        }

        private static string GetEntryAssemblyPath(string versionPath, ModuleManifest manifest)
        {
            return Path.Combine(versionPath, "backend", manifest.EntryAssembly);
        }

        private static void RemoveDepsJsonFiles(string directoryPath)
        {
            foreach (var depsJson in Directory.GetFiles(directoryPath, "*.deps.json", SearchOption.AllDirectories))
            {
                try { File.Delete(depsJson); } catch { }
            }
        }

        private static bool HasLoadedDifferentVersionOfAssembly(string assemblyPath)
        {
            if (!File.Exists(assemblyPath))
                return false;

            var requestedAssemblyName = AssemblyName.GetAssemblyName(assemblyPath);
            return AssemblyLoadContext.Default.Assemblies.Any(x =>
                string.Equals(x.GetName().Name, requestedAssemblyName.Name, StringComparison.OrdinalIgnoreCase)
                && !string.Equals(x.GetName().FullName, requestedAssemblyName.FullName, StringComparison.OrdinalIgnoreCase));
        }

        private Assembly LoadAssemblyIfNeeded(string assemblyPath)
        {
            var loaded = AssemblyLoadContext.Default.Assemblies.FirstOrDefault(x => string.Equals(x.Location, assemblyPath, StringComparison.OrdinalIgnoreCase));
            if (loaded != null)
                return loaded;

            var requestedAssemblyName = AssemblyName.GetAssemblyName(assemblyPath);
            loaded = AssemblyLoadContext.Default.Assemblies.FirstOrDefault(x => string.Equals(x.GetName().FullName, requestedAssemblyName.FullName, StringComparison.OrdinalIgnoreCase));
            if (loaded != null)
                return loaded;

            return AssemblyLoadContext.Default.LoadFromAssemblyPath(assemblyPath);
        }

        private ModuleManifest ReadManifest(string versionPath)
        {
            var manifestPath = Path.Combine(versionPath, "module.json");
            if (!File.Exists(manifestPath))
                return null;

            var manifest = JsonSerializer.Deserialize<ModuleManifest>(File.ReadAllText(manifestPath), _jsonOptions);
            if (manifest != null)
                NormalizeManifest(manifest);
            return manifest;
        }

        private static void NormalizeManifest(ModuleManifest manifest)
        {
            manifest.Id = manifest.Id?.Trim() ?? string.Empty;
            manifest.Version = manifest.Version?.Trim() ?? string.Empty;
            manifest.DisplayName = manifest.DisplayName?.Trim() ?? string.Empty;
            manifest.EntryAssembly = manifest.EntryAssembly?.Trim() ?? string.Empty;
            manifest.ReactEntryPoint = string.IsNullOrWhiteSpace(manifest.ReactEntryPoint) ? "index.html" : manifest.ReactEntryPoint.Trim();
            manifest.Dependencies ??= new List<ModuleDependency>();
            manifest.RequiredPermissions ??= new List<string>();
            manifest.DatabaseProviders ??= new List<string>();
            manifest.Migrations ??= new List<ModuleMigrationDefinition>();
            manifest.Menus ??= new List<ModuleMenuDefinition>();
            manifest.Settings ??= new List<ModuleSettingDefinition>();
        }

        private static bool IsValidModuleVersion(string version)
        {
            return Regex.IsMatch(version, @"^\d+\.\d+\.\d+(\.\d+)?([\-+][0-9A-Za-z.-]+)?$");
        }

        private static bool IsEmbeddedMigrationReference(string migrationPath)
        {
            return migrationPath.Equals("embedded", StringComparison.OrdinalIgnoreCase)
                   || migrationPath.StartsWith("embedded:", StringComparison.OrdinalIgnoreCase)
                   || migrationPath.StartsWith("db.mssql.", StringComparison.OrdinalIgnoreCase);
        }

        private static bool ShouldSkipAppliedMigration(string migrationType)
        {
            return !migrationType.Equals("install", StringComparison.OrdinalIgnoreCase)
                   && !migrationType.Equals("uninstall", StringComparison.OrdinalIgnoreCase);
        }

        private static IEnumerable<string> GetEmbeddedRouteTokens(string fromVersion, string toVersion)
        {
            yield return $"{fromVersion}_to_{toVersion}";
            yield return $"{NormalizeMigrationVersionToken(fromVersion)}_to_{NormalizeMigrationVersionToken(toVersion)}";
        }

        private static string NormalizeMigrationVersionToken(string version)
        {
            return Regex.Replace(version ?? string.Empty, "[^A-Za-z0-9]+", "_").Trim('_');
        }

        private static string GetEmbeddedMigrationName(Assembly assembly, string migrationType, string resourceName)
        {
            var prefix = $"{assembly.GetName().Name}.db.mssql.{migrationType}.";
            if (!resourceName.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                return resourceName;

            var name = resourceName[prefix.Length..];
            return name.Equals("sql", StringComparison.OrdinalIgnoreCase) ? $"{migrationType}.sql" : name;
        }

        private sealed class ModuleMigrationScript
        {
            public ModuleMigrationScript(string name, string source, string sql)
            {
                Name = name;
                Source = source;
                Sql = sql;
            }

            public string Name { get; }
            public string Source { get; }
            public string Sql { get; }
        }

        private async Task WriteActiveVersionAsync(string moduleId, string version, long userId)
        {
            var pointer = new ModuleVersionPointer
            {
                ModuleId = moduleId,
                Version = version,
                ActivatedBy = userId.ToString(),
                ActivatedOn = DateTime.UtcNow
            };
            var path = Path.Combine(GetModuleRoot(moduleId), "active-version.json");
            await File.WriteAllTextAsync(path, JsonSerializer.Serialize(pointer, _jsonOptions));
        }

        private async Task WriteStateFileAsync(string moduleId, string version, ModuleLifecycleState lifecycleState, ModuleRuntimeState runtimeState, string lastError)
        {
            var state = new ModuleStateFile
            {
                ModuleId = moduleId,
                ActiveVersion = version,
                LifecycleState = lifecycleState,
                RuntimeState = runtimeState,
                UpdatedOn = DateTime.UtcNow,
                LastError = lastError ?? string.Empty
            };
            var path = Path.Combine(GetModuleRoot(moduleId), "module-state.json");
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            await File.WriteAllTextAsync(path, JsonSerializer.Serialize(state, _jsonOptions));
        }

        private void EnsureModuleDirectories()
        {
            Directory.CreateDirectory(GetModulesPath());
            Directory.CreateDirectory(GetUploadPath());
            Directory.CreateDirectory(GetTempStagingPath());
        }

        private string GetModulesPath()
        {
            return Path.Combine(_hostingEnvironment.ContentRootPath, "App_Data", "Modules");
        }

        private string GetUploadPath()
        {
            return Path.Combine(GetModulesPath(), "_uploads");
        }

        private string GetTempStagingPath()
        {
            return Path.Combine(GetModulesPath(), "_staging");
        }

        private string GetModuleRoot(string moduleId)
        {
            return Path.Combine(GetModulesPath(), moduleId);
        }

        private string GetVersionPath(string moduleId, string version)
        {
            return Path.Combine(GetModuleRoot(moduleId), "versions", version);
        }

        private static async Task<string> ComputeFileHashAsync(string path)
        {
            using (var sha256 = SHA256.Create())
            using (var stream = File.OpenRead(path))
            {
                return Convert.ToHexString(await sha256.ComputeHashAsync(stream)).ToLowerInvariant();
            }
        }

        private static string ComputeTextHash(string value)
        {
            using (var sha256 = SHA256.Create())
            {
                return Convert.ToHexString(sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(value ?? string.Empty))).ToLowerInvariant();
            }
        }

        private static bool HashEquals(string expected, string actual)
        {
            expected = expected.Replace("sha256:", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
            actual = actual.Replace("sha256:", string.Empty, StringComparison.OrdinalIgnoreCase).Trim();
            return expected.Equals(actual, StringComparison.OrdinalIgnoreCase);
        }
    }
}
