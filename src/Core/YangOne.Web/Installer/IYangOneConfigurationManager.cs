// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Installer
{
    /// <summary>
    /// Manages installation, uninstallation, and backup of the application.
    /// </summary>
    public interface IYangOneConfigurationManager
    {
        Task<bool> Install(string connectionString);
        Task<bool> Install(InstallationDbInfo model);
        Task<bool> Install(string connectionString, string dbProvider);
        Task<bool> Unintall(string connectionString);
        Task<string> BackUpDb(string connectionString);
        Task<string> BackUpSystem();
        Task<bool> CheckConnection(string connectionString, string dbProvider);
    }
}
