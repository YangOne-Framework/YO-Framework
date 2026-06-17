// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Plugin
{
    
    public interface IPlugin
    {
        string SystemName { get; }
        Task<bool> Install();
        Task<bool> UnInstall();
        PluginConfig Configuration { get; set; }

    }

}
