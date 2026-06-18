// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Plugin
{
    
    /// <summary>
    /// Defines the contract for a plugin.
    /// </summary>
    public interface IPlugin
    {
        string SystemName { get; }
        Task<bool> Install();
        Task<bool> UnInstall();
        PluginConfig Configuration { get; set; }

    }

}
