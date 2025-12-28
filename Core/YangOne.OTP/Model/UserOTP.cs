using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.OTP.Model;

[Table("UserOTP")]
public class UserOTP
{
    [Key]
    public long UserOTPId { get; set; }
    public long UserId { get; set; }
    public string OTPCode { get; set; }
    public bool IsExpired { get; set; }
}