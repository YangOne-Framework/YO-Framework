// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    public interface IModuleManager
    {
        Task<bool> InstallAsync(IModule module);
        Task<bool> UnInstallAsync(IModule module);
        Task<IModule> FindAsync(string moduleName);
        Task<bool> UpdateModule(IModule module);

    }
}
