// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Dto
{
    public class ModuleApiInfoDto
    {
        public string ModuleName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string ActiveVersion { get; set; } = string.Empty;
        public string StagedVersion { get; set; } = string.Empty;
        public string LifecycleState { get; set; } = string.Empty;
        public string RuntimeState { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsInstalled { get; set; }
        public bool IsRestartRequired { get; set; }
        public string PackagePath { get; set; } = string.Empty;
    }
}

