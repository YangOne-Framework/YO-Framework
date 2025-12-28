using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

public class EditUser : AppUser
{

    public List<int> UserRoleIds { get; set; }
    public List<UserRolesSelected> UserRoles { get; set; }


}