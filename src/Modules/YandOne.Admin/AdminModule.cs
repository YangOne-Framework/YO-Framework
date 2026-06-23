// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;
using YangOne.Web.Module;

namespace YandOne.Admin;

/// <summary>
/// Admin module metadata.
/// </summary>
public class AdminModule : IModule
{
    public string Name { get; set; } = "YandOne.Admin";
    public string Version { get; set; } = GetAssemblyVersion();
    public List<string> SupportedVersions { get; set; } = new() { "1.0.0" };
    public string Author { get; set; } = "YangOne";
    public Assembly Assembly { get; set; } = typeof(AdminModule).Assembly;
    public bool IsInstalled { get; set; } = true;
    public bool RequireSettingComponent { get; set; }
    public string ModuleSettingComponent { get; set; } = string.Empty;

    private static string GetAssemblyVersion()
    {
        var version = typeof(AdminModule).Assembly
            .GetCustomAttribute<AssemblyInformationalVersionAttribute>()?
            .InformationalVersion;

        return string.IsNullOrWhiteSpace(version) ? "1.0.0" : version.Split('+')[0];
    }
}