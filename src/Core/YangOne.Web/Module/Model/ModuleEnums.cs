// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Module
{
    /// <summary>
    /// Durable module lifecycle states stored independently from runtime load status.
    /// </summary>
    public enum ModuleLifecycleState
    {
        Uploaded = 0,
        Validated = 1,
        Staged = 2,
        PendingInstall = 3,
        Installing = 4,
        InstalledDisabled = 5,
        PendingEnable = 6,
        Enabled = 7,
        PendingDisable = 8,
        Disabled = 9,
        PendingUpgrade = 10,
        Upgrading = 11,
        UpgradeFailed = 12,
        PendingRollback = 13,
        RollingBack = 14,
        PendingUninstall = 15,
        Uninstalling = 16,
        Uninstalled = 17,
        Failed = 18
    }

    /// <summary>
    /// Current runtime load state for the active module assembly.
    /// </summary>
    public enum ModuleRuntimeState
    {
        NotLoaded = 0,
        Loading = 1,
        Loaded = 2,
        Stopping = 3,
        Stopped = 4,
        Faulted = 5
    }

    public enum ModuleOperationType
    {
        Upload = 0,
        Validate = 1,
        Install = 2,
        Enable = 3,
        Disable = 4,
        Upgrade = 5,
        Rollback = 6,
        Uninstall = 7,
        Resume = 8
    }

    public enum ModuleOperationStatus
    {
        Started = 0,
        Succeeded = 1,
        Failed = 2,
        RequiresRestart = 3
    }
}
