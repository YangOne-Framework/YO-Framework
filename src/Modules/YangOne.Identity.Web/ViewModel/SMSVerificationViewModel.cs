using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

public class SMSVerificationViewModel
{
    public string PhoneNumber { get; set; }
    [Required]
    public string OTP { get; set; }
    public string Email { get; set; }
}