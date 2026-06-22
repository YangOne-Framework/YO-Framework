// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;
using YangOne.Web.Module;

namespace YangOne.Sample.Inventory.Module
{
    /// <summary>
    /// Module metadata discovered from module package assembly.
    /// </summary>
    public class SampleInventoryModule : IModule
    {
        public string Name { get; set; } = "YangOne.Sample.Inventory";
        public string Version { get; set; } = GetAssemblyVersion();
        public List<string> SupportedVersions { get; set; } = new() { "1.0.0", "1.1.0" };
        public string Author { get; set; } = "YangOne";
        public Assembly Assembly { get; set; } = typeof(SampleInventoryModule).Assembly;
        public bool IsInstalled { get; set; }
        public bool RequireSettingComponent { get; set; }
        public string ModuleSettingComponent { get; set; } = string.Empty;

        private static string GetAssemblyVersion()
        {
            var version = typeof(SampleInventoryModule).Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
                .InformationalVersion;

            return string.IsNullOrWhiteSpace(version) ? "1.0.0" : version.Split('+')[0];
        }
    }
}
