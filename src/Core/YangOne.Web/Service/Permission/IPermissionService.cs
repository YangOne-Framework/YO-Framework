// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    /// <summary>
    /// Defines the contract for permission management operations.
    /// </summary>
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
