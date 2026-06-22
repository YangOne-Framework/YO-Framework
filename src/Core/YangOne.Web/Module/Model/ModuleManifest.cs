// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    /// <summary>
    /// Contract expected in module.json inside installable module packages.
    /// </summary>
    public class ModuleManifest
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string Publisher { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CmsMinimumVersion { get; set; } = string.Empty;
        public string CmsMaximumVersion { get; set; } = string.Empty;
        public string RequiredDotNetRuntime { get; set; } = string.Empty;
        public string EntryAssembly { get; set; } = string.Empty;
        public string ApiRoutePrefix { get; set; } = string.Empty;
        public string ReactEntryPoint { get; set; } = "index.html";
        public string AdminRoute { get; set; } = string.Empty;
        public string UserRoute { get; set; } = string.Empty;
        public bool RestartRequired { get; set; } = true;
        public string PackageHash { get; set; } = string.Empty;
        public string DigitalSignature { get; set; } = string.Empty;
        public string DataRetentionPolicy { get; set; } = string.Empty;
        public string HealthCheckEndpoint { get; set; } = string.Empty;
        public List<ModuleDependency> Dependencies { get; set; } = new();
        public List<string> RequiredPermissions { get; set; } = new();
        public List<string> DatabaseProviders { get; set; } = new();
        public List<ModuleMigrationDefinition> Migrations { get; set; } = new();
        public List<ModuleMenuDefinition> Menus { get; set; } = new();
        public List<ModuleSettingDefinition> Settings { get; set; } = new();
    }

    public class ModuleDependency
    {
        public string ModuleId { get; set; } = string.Empty;
        public string MinimumVersion { get; set; } = string.Empty;
        public string MaximumVersion { get; set; } = string.Empty;
        public bool Required { get; set; } = true;
    }

    public class ModuleMigrationDefinition
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Path { get; set; } = string.Empty;
        public string FromVersion { get; set; } = string.Empty;
        public string ToVersion { get; set; } = string.Empty;
    }

    public class ModuleMenuDefinition
    {
        public string Key { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public int Order { get; set; }
        public string ParentKey { get; set; } = string.Empty;
        public int MenuGroupId { get; set; } = 1;
        public bool IsBackend { get; set; } = true;
        public bool AllowAccessForAll { get; set; } = false;
    }

    public class ModuleSettingDefinition
    {
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public string DefaultValue { get; set; } = string.Empty;
        public bool Required { get; set; }
    }
}
