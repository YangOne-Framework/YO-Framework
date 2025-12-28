using YangOne.OTP.Model;
using YangOne.Data;

namespace YangOne.OTP.Service
{
    public interface IOTPService
    {

        CrudService<OTPSetting> SettingService { get; set; }
        CrudService<UserSecretKey> UserSecretService { get; set; }
        CrudService<UserOTP> OTPLogService { get; set; }
        Task<string> Generate(long userId);
        Task<bool> Verify(string otpCode, long userId);
        Task<string> DirectGenerate(string guid);
        Task<bool> DirectVerify(string guid, string otpCode);
        Task<OTPSetting> GetSetting();



    }
}