// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Model;
using YangOne.Data;

namespace YangOne.Identity.Service
{
    /// <summary>
    /// Defines the contract for login history services.
    /// </summary>
    public interface ILoginHistoryService
    {
        CrudService<UserLoginHistory> HistoryService { get; set; }
        Task<UserLoginHistory> GetLastLoginInfoAsync(long userId);
        Task<bool> RemoveDeviceAsync(string deviceIdentifier,long userId);
        Task<bool> CheckLoginDeviceAsync(string deviceIdentifier, long userId);
        Task<int> GetUserLoggedInDevicesNumber(long userId);

    }
}
