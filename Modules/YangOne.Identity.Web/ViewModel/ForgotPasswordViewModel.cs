using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel
{
    public class ForgotPasswordViewModel
    {
        [Required]
        public string EmailOrUserName { get; set; }
    }
}