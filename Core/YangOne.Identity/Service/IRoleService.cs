using YangOne.Data;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;

namespace YangOne.Identity.Service
{ 
    public interface IIdentityRoleService
    {
        CrudService<IdentityRole> RoleService { get; set; }

        Task<IEnumerable<IdentityRole>> GetUserRolesAsync(long identityUserId);
        Task<bool> CheckNameExist(string roleName);
        Task<List<int>> GetRoleIds(string[] roleNames);
        Task<List<BasicUserDetails>> GetUserByRolesName(string rolename);
    }
}