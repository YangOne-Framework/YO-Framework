// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines operations for managing module lifecycle.
    /// </summary>
    public interface IModuleManager
    {
        Task<bool> InstallAsync(IModule module);
        Task<bool> UnInstallAsync(IModule module);
        IModule Find(string moduleName);
        Task<IModule> FindAsync(string moduleName);
        Task<bool> UpdateModule(IModule module);
        Task<ModulePackageValidationResult> UploadPackageAsync(Stream packageStream, string fileName, long userId);
        Task<ModulePackageValidationResult> ValidatePackageAsync(string packagePath);
        Task<ModuleOperationResult> InstallPackageAsync(string moduleName, string version, long userId);
        Task<ModuleOperationResult> EnableAsync(string moduleName, long userId);
        Task<ModuleOperationResult> DisableAsync(string moduleName, long userId);
        Task<ModuleOperationResult> UpgradeAsync(string moduleName, string version, long userId);
        Task<ModuleOperationResult> RollbackAsync(string moduleName, string version, long userId);
        Task<ModuleOperationResult> UninstallPackageAsync(string moduleName, bool purgeData, long userId);
        Task<IEnumerable<ModuleOperationJournal>> GetOperationJournalAsync(string moduleName, int count = 50);
        Task<ModuleOperationResult> PingAsync(string moduleName);
    }
}
