// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines data operations for module persistence.
    /// </summary>
    public interface IModuleService
    {
        CrudService<ModuleInfo> Service { get; set; }
        CrudService<ModuleOperationJournal> OperationJournalService { get; set; }
        CrudService<ModuleMigrationHistory> MigrationHistoryService { get; set; }
        Task EnsureModuleManagementSchemaAsync();
        Task<bool> Save(IModule module);
        Task<ModuleInfo> GetByNameAsync(string moduleName);
        Task<IEnumerable<ModuleInfo>> GetAllAsync();
        Task<bool> SavePackageAsync(ModuleManifest manifest, string packageHash, string versionPath, string stagingPath, string manifestJson, ModuleLifecycleState state, long userId);
        Task<bool> SyncManifestRegistrationAsync(ModuleManifest manifest, string packageHash, string versionPath, string manifestJson, ModuleLifecycleState state, bool isActive, long userId);
        Task<bool> DeactivateManifestRegistrationAsync(string moduleName, string version, long userId);
        Task<bool> UpdateStateAsync(string moduleName, string version, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string operation, string error, bool restartRequired, long userId);
        Task<bool> SetActiveVersionAsync(string moduleName, string version, string versionPath, long userId);
        Task<bool> Uninstall(string moduleName);
        Task<bool> ReInstall(string moduleName);
        Task<ModuleOperationJournal> AddOperationAsync(string moduleName, string version, ModuleOperationType operationType, ModuleOperationStatus status, ModuleLifecycleState state, ModuleRuntimeState runtimeState, string message, object payload, IEnumerable<string> errors, long userId);
        Task<IEnumerable<ModuleOperationJournal>> GetOperationJournalAsync(string moduleName, int count = 50);
        Task<bool> RecordMigrationAsync(string moduleName, string version, string migrationName, string migrationType, string scriptPath, string scriptHash, bool succeeded, string errorMessage, long userId);
        Task<bool> HasMigrationAsync(string moduleName, string version, string scriptHash);
    }
}
