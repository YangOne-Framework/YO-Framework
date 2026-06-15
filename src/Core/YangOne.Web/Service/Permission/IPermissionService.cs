using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public interface IPermissionService
    {
       
        CrudService<ApplicationController> AppControllerCrudService { get; set; }
        CrudService<ApplicationControllerAction> ApplicationControllerActionCrudService { get; set; }
        CrudService<MasterRolePermission> RolePermissionCrudService { get; set; }
        CrudService<UserPermission> UserPermissionCrudService { get; set; }
        Task<IEnumerable<ApplicationController>> SaveApplicationControllers(List<ApplicationController> appControllers);
        Task<bool> SaveApplicationControllerActions(List<ApplicationControllerAction> actions);
        Task<IEnumerable<MasterRolePermission>> GetRolePermissionsById(int roleId);
        Task SaveRolePermissions(RolePermissionViewModel rolePermissions);
        Task<IEnumerable<UserPermission>> GetUserPermissionsById(long userId);
        Task SaveUserPermissions(UserPermissionViewModel userPermissions);
        Task<IEnumerable<string>> GetMyPermissions(long userId);
        Task<IEnumerable<MasterRolePermission>> GetAllRolesPermissions();
        Task InitializeAsync();
        Task CleanupAsync();
    }
}