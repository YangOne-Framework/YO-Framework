// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;

namespace YangOne.Identity.Service
{
    public interface IUserDeviceService
    {
        CrudService<UserDevice> DeviceService { get; set; }

        Task<UserDeviceStatus> GetUserDeviceStatus(long userId);

        Task<bool> SendDeviceVerification(long userId);
        Task<DeviceVerificationStatus> VerifyDevice(long userId, long userDeviceId);
        Task<UserDeviceStatus> CheckAndSaveDevice(UserDevice userDevice);
        Task<bool> RemoveDeviceAsync(long userDeviceId, long userId);
    }
}
