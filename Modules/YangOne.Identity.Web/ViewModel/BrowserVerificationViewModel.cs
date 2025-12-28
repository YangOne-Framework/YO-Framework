using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

public class BrowserVerificationViewModel
{
    [Required]
    public string Email { get; set; }

    public string? PhoneNumber { get; set; }
    [Required]
    public string OTP { get; set; }
    public string ReturnUrl { get; set; }
}