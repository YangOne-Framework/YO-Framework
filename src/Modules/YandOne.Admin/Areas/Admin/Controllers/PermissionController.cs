using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Crud.Attribute;
using YangOne.Identity.Dto;
using YangOne.Identity.Service;
using YangOne.Web;
using YangOne.Web.Service;
using Microsoft.AspNetCore.Authorization;
using YangOne.Web.Security;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class PermissionController : BaseController
    {
        private readonly IPermissionService permissionService;
        private readonly IIdentityRoleService identityRoleService;
        private readonly IActionDescriptorCollectionProvider actionDescriptorCollectionProvider;

        public PermissionController(IPermissionService permissionService, IIdentityRoleService identityRoleService
            , IActionDescriptorCollectionProvider actionDescriptorCollectionProvider)
        {
            this.permissionService = permissionService;
            this.identityRoleService = identityRoleService;
            this.actionDescriptorCollectionProvider = actionDescriptorCollectionProvider;
        }

        [NonAction]
        internal async Task<List<UserRolesSelected>> GetRoles(List<int> roleIds = null)
        {
            var _roles = await identityRoleService.RoleService.GetListAsync();
            var roles=_roles.Where(x=>x.Id!=1);
            var model = roles.Select(r => new UserRolesSelected
            {
                RoleId = r.Id,
                IsSelected = roleIds != null ? roleIds.Contains((int)r.Id) : false,
                Name = r.Name
            }).ToList();
            return model;
        }
        [HttpGet]
        [Route("admin/permission")]
        [FriendlyName("Permission Page")]
        public async Task<IActionResult> Index(int id)
        {
            ViewData["Roles"] = await GetRoles();
            var rolePermission = await permissionService.GetRolePermissionsById(id);
            return View(rolePermission);
        }

        [HttpPost]
        [Route("admin/permission/save")]
        [FriendlyName("Permission Page Save")]
        public async Task<IActionResult> UpdatePermissionPage(RolePermissionViewModel rolePermissions)
        {
            await permissionService.SaveRolePermissions(rolePermissions);
            return RedirectToAction("Index", new { Id = rolePermissions.RolePermission.FirstOrDefault().RoleId });
        }

       
    }

}