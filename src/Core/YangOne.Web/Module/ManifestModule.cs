// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;

namespace YangOne.Web.Module
{
    /// <summary>
    /// IModule adapter for validated packages that are loaded from App_Data/Modules.
    /// </summary>
    public class ManifestModule : IModule
    {
        public ManifestModule(ModuleManifest manifest, Assembly assembly, string moduleRootPath, string versionPath)
        {
            Manifest = manifest;
            Name = manifest.Id;
            Version = manifest.Version;
            Author = manifest.Publisher;
            Assembly = assembly;
            ModuleRootPath = moduleRootPath;
            VersionPath = versionPath;
            FrontendPath = Path.Combine(versionPath, "frontend");
            IsInstalled = true;
        }

        public ModuleManifest Manifest { get; }
        public string ModuleRootPath { get; }
        public string VersionPath { get; }
        public string FrontendPath { get; }
        public string Name { get; set; }
        public string Version { get; set; }
        public List<string> SupportedVersions { get; set; } = new();
        public string Author { get; set; }
        public Assembly Assembly { get; set; }
        public bool IsInstalled { get; set; }
        public bool RequireSettingComponent { get; set; }
        public string ModuleSettingComponent { get; set; }
    }
}
