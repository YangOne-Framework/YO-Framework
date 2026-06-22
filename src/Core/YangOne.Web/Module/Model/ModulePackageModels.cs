// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    public class ModulePackageValidationResult
    {
        public bool IsValid => Errors.Count == 0;
        public string ModuleId { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public string PackageHash { get; set; } = string.Empty;
        public string StagingPath { get; set; } = string.Empty;
        public string VersionPath { get; set; } = string.Empty;
        public ModuleManifest Manifest { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();
    }

    public class ModuleOperationResult
    {
        public bool Succeeded { get; set; }
        public bool RequiresRestart { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public ModuleLifecycleState State { get; set; }
        public ModuleRuntimeState RuntimeState { get; set; }
        public string Message { get; set; } = string.Empty;
        public List<string> Errors { get; set; } = new();
        public List<string> Warnings { get; set; } = new();

        public static ModuleOperationResult Success(string moduleName, string version, ModuleLifecycleState state, string message, bool requiresRestart = false)
        {
            return new ModuleOperationResult
            {
                Succeeded = true,
                RequiresRestart = requiresRestart,
                ModuleName = moduleName,
                Version = version,
                State = state,
                Message = message
            };
        }

        public static ModuleOperationResult Fail(string moduleName, string version, ModuleLifecycleState state, string message, IEnumerable<string> errors = null)
        {
            return new ModuleOperationResult
            {
                Succeeded = false,
                ModuleName = moduleName,
                Version = version,
                State = state,
                Message = message,
                Errors = errors?.ToList() ?? new List<string> { message }
            };
        }
    }

    public class ModuleVersionPointer
    {
        public string ModuleId { get; set; } = string.Empty;
        public string Version { get; set; } = string.Empty;
        public DateTime ActivatedOn { get; set; } = DateTime.UtcNow;
        public string ActivatedBy { get; set; } = string.Empty;
    }

    public class ModuleStateFile
    {
        public string ModuleId { get; set; } = string.Empty;
        public string ActiveVersion { get; set; } = string.Empty;
        public ModuleLifecycleState LifecycleState { get; set; } = ModuleLifecycleState.Uploaded;
        public ModuleRuntimeState RuntimeState { get; set; } = ModuleRuntimeState.NotLoaded;
        public DateTime UpdatedOn { get; set; } = DateTime.UtcNow;
        public string LastError { get; set; } = string.Empty;
    }
}
