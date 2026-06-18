// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines a module in the YO Framework.
    /// </summary>
    public interface IModule
    {
        string Name { get; set; }
        string Version { get; set; }
        List<string> SupportedVersions { get; set; }
        string Author { get; set; }
        Assembly Assembly { get; set; }
        bool IsInstalled { get; set; }
        bool RequireSettingComponent { get; set; }
        string ModuleSettingComponent { get; set; } 
    }
}
