using YangOne.Identity.Model;

namespace YangOne.Identity.Web.ViewModel
{
    public class UserRegisterViewModel : AppUser
    {
        public int[] Roles { get; set; }
        public string Password { get; set; }
    }
}
