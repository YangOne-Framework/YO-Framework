// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;

namespace YangOne.FCM
{
    public interface IFCMDeviceService
    {
        CrudService<UserFCMDevice> FCMDeviceCrudService { get; set; }

        Task AddUserFcmDevice(UserFCMDevice userFCMDevice);

        Task<List<string>> GetFcmTokenByUserId(long userId);

        Task UpdateFCMGroupbyUserId(long userId, string groupName);

        Task<IEnumerable<string>> GetFcmTokensByUserIds(string userIds);
        Task LogoutFCMDevice(long userId,string deviceId);
    }
       
}
