using System.Data.Common;
using System.Text;
using Dapper;
using YangOne.Caching;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.OTP.Model;
using YangOne.OTP.Service;

namespace YangOne.OTP.Services
{
    public class OTPService : IOTPService
    {
        private readonly ICacheService _cacheService;

        public OTPService(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public CrudService<OTPSetting> SettingService { get; set; } = new CrudService<OTPSetting>();
        public CrudService<UserSecretKey> UserSecretService { get; set; } = new CrudService<UserSecretKey>();
        public CrudService<UserOTP> OTPLogService { get; set; } = new CrudService<UserOTP>();

        private async Task<string> GetUserSecret(long userId)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.ExecuteScalarAsync<string>("select SecretKey from  [dbo].[UserSecretKey] Where UserId=@UserId ", new { UserId = userId });
            }
        }

        public async Task<string> Generate(long userId)
        {
            var setting = await GetSetting();
            var us = await GetUserSecret(userId);
            if (string.IsNullOrEmpty(us))
            {
                Guid g = Guid.NewGuid();
                string guidString = Convert.ToBase64String(g.ToByteArray());
                guidString = guidString.Replace("=", "");
                guidString = guidString.Replace("+", "");
                us = guidString;
                var userSec = new UserSecretKey
                {
                    UserId = userId,
                    SecretKey = us
                };
                userSec.AutoFill();
                await UserSecretService.InsertAsync<long>(userSec);
            }
            var totp = new Totp(Encoding.UTF8.GetBytes(us), setting.ExpiryTime);
            var otpCode = totp.ComputeTotp();
            var otpLog = new UserOTP { OTPCode = otpCode, UserId = userId };
            await OTPLogService.InsertAsync(otpLog);
            return otpCode;
        }

        public async Task<bool> Verify(string otpCode, long userId)
        {
            var setting = await GetSetting();

            var us = await GetUserSecret(userId);
            var totp = new Totp(Encoding.UTF8.GetBytes(us), setting.ExpiryTime);
            var isGood = totp.VerifyTotp(otpCode, out var timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);
            var otpLog = new UserOTP { OTPCode = otpCode, UserId = userId, IsExpired = true };
            await OTPLogService.UpdateAsync(otpLog, " Where UserId=@UserId and OTPCode=@OTPCode", new { IsExpired = true, UserId = userId, OTPCode = otpCode });
            return isGood;
        }

        public async Task<string> DirectGenerate(string guid)
        {
            var setting = await GetSetting();

            var us = guid;
            var totp = new Totp(Encoding.UTF8.GetBytes(us), setting.ExpiryTime);
            var otpCode = totp.ComputeTotp();
            return otpCode;
        }
        public async Task<bool> DirectVerify(string guid, string otpCode)
        {
            var setting = await GetSetting();
            var us = guid;
            var totp = new Totp(Encoding.UTF8.GetBytes(us), setting.ExpiryTime);
            var isGood = totp.VerifyTotp(otpCode, out var timeStepMatched, VerificationWindow.RfcSpecifiedNetworkDelay);
            return isGood;
        }

        public async Task<OTPSetting> GetSetting()
        {
            return await _cacheService.GetAsync("OTPSETTING", () => SettingService.GetAsync(1), TimeSpan.FromMinutes(5));

        }
    }
}
