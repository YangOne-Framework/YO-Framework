// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Plugin
{
    /// <summary>
    /// Represents the result of a plugin installation operation.
    /// </summary>
    public class PluginInstallStatus
    {
        public bool IsInstalled { get; set; }
        public bool HasError { get; set; }
        public string ErrorMessage { get; set; }
    }
}
