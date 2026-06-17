// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;

namespace YangOne.Web.Module
{
    public interface IModuleService
    {
        CrudService<ModuleInfo> Service { get; set; }
        Task<bool> Save(IModule module);
        Task<bool> Uninstall(string moduleName);
        Task<bool> ReInstall(string moduleName);
    }
}
