using Dapper;
using System.Data.Common;
using YangOne.Data;
using YangOne.Data.Extension;

namespace YangOne.FCM
{
    public class FCMDeviceService : IFCMDeviceService
    {

        public CrudService<UserFCMDevice> FCMDeviceCrudService { get; set; } = new CrudService<UserFCMDevice>();

        public async Task AddUserFcmDevice(UserFCMDevice userFCMDevice)
        {

            if (string.IsNullOrEmpty(userFCMDevice.DeviceId))
            {
                throw new Exception("device id not found.");
            }
            else
            {
                //var duplicate = await FCMDeviceCrudService.RecordCountAsync("where DeviceId=@token and UserId=@userId", new { token = userFCMDevice.DeviceId.Trim(), userId= userFCMDevice.UserId });
                //if (duplicate==0)
                //{
                //    userFCMDevice.AutoFill();
                //    await FCMDeviceCrudService.InsertAsync(userFCMDevice);
                //}
                //else
                //{
                //    userFCMDevice = await FCMDeviceCrudService.GetAsync("where DeviceId=@token and UserId=@userId", new { token = userFCMDevice.DeviceId.Trim(), userId = userFCMDevice.UserId });
                //    userFCMDevice.AutoFill();
                //    await FCMDeviceCrudService.UpdateAsync(userFCMDevice);
                //}

                //
                var dbFactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    var duplicate = await FCMDeviceCrudService.RecordCountAsync("where DeviceId=@DeviceId and UserId=@userId and IsActive=@IsActive and IsDeleted=@IsDeleted", new {IsActive=true, userFCMDevice.DeviceId,IsDeleted=false, userId = userFCMDevice.UserId });
                    if (duplicate == 0)
                    {
                        userFCMDevice.AutoFill();
                        userFCMDevice.IsActive = true;
                        await FCMDeviceCrudService.InsertAsync(userFCMDevice);
                    }
                    else
                    {

                    }
                       // await db.ExecuteAsync("update UserFCMDevice set DeviceId=@DeviceId, IsActive=1 where UserId=@UserId ", new { UserId = userFCMDevice.UserId, DeviceId = userFCMDevice.DeviceId.Trim() });
                    //update if FCM Exists
                    //await db.ExecuteAsync("update UserFCMDevice set DeviceId='' where UserId!=@UserId and DeviceId=@DeviceId and IsDeleted!=1", new { UserId = userFCMDevice.UserId, DeviceId = userFCMDevice.DeviceId.Trim() });
                }
            }

        }

        public async Task<List<string>> GetFcmTokenByUserId(long userId)
        {
            var fmcTokens = await FCMDeviceCrudService.GetListAsync("Where UserId=@UserId and IsActive=@IsActive", new { IsActive=true, UserId = userId });
            var ss = fmcTokens.Select(x => x.DeviceId).ToList();
            return ss;
        }


        public async Task UpdateFCMGroupbyUserId(long userId, string groupName)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                await db.ExecuteAsync("update  UserFCMDevice set groupName=@GroupName where userId=@UserId",
                       new { UserId = userId, GroupName = groupName });
            }

        }

        public async Task<IEnumerable<string>> GetFcmTokensByUserIds(string userIds)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var data = await db.QueryAsync<string>(@"select deviceid from UserFCMDevice
                                                      where IsActive=@IsActive and userid in ( select items from dbo.udf_Split('@userIds',',') )",
                                                       new { userIds, IsActive=true });
                return data;
            }
        }
        public async Task LogoutFCMDevice(long userId, string deviceId)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"update UserFCMDevice set IsActive=0 where UserId=@UserId and DeviceId=@deviceId", new { deviceId, UserId = userId });
            }
        }

    }
}