// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using Microsoft.AspNetCore.Http;

namespace YangOne.Plugin
{
    /// <summary>
    /// Provides methods to manage plugins, including installation, status updates, and discovery.
    /// </summary>
    public interface IPluginService
    {
        CrudService<Plugin> PluginCrudService { get; set; }
        Task<bool> UpdateStatus(Plugin plugin);
        Task<bool> AddPlugins(IEnumerable<Plugin> plugins);
        Task<PluginInstallStatus> UnzipAndInstall(IFormFile zipFile);
    }
}
