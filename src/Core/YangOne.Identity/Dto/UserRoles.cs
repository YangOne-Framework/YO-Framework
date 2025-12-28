using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

public class UserRoles
{
    public long IdentityUserId { get; set; }
    public List<IdentityRole> Roles { get; set; }
}