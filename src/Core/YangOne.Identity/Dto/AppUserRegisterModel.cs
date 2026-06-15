using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

public class AppUserRegisterModel : AppUser
{
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    public List<int> RoleIds { get; set; } = new();
}