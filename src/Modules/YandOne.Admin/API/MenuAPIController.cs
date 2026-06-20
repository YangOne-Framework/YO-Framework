// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YandOne.Admin.ViewModel;
using YangOne.Admin.Service;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Identity.Extensions;
using YangOne.Identity.Service;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;

namespace YandOne.Admin.API;

[Route("api/v1/menu")]
/// <summary>
/// Represents a class MenuAPIController.
/// </summary>
public class MenuAPIController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IMenuService _menuService;
    private readonly IIdentityRoleService _identityRoleService;

    public MenuAPIController(
        ILogger logger,
        IMenuService menuService,
        IIdentityRoleService identityRoleService)
    {
        _logger = logger;
        _menuService = menuService;
        _identityRoleService = identityRoleService;
    }
    [HttpGet("mainnavigation")]

    public async Task<ActionResult<ApiResponse<IEnumerable<MenuViewModel>>>> GetMenuByGroup()
    {
        try
        {
           
            var data = await _menuService.GetSiteFrontendMenuForUser();

            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<MenuViewModel>>(501, e.Message);
        }
    }
    #region Lists

    /// <summary>
    /// Get admin navigation menus by user roles (calls usp_Menu_GetAdminAllByRole).
    /// </summary>
    [HttpGet("admin-menus")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MenuViewModel>>>> GetAdminMenusByRole()
    {
        try
        {
           

            var data = await _menuService.GetAdminMenusByRole(string.Join(',',User.Identity.GetRoles()));
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<MenuViewModel>>(501, e.Message);
        }
    }

    [HttpGet("group")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Menu>>>> GetMenuByGroup([FromQuery] int groupId = 0,
        [FromQuery] int offset = 01,
        [FromQuery] int limit = 50,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _menuService.MenuCrudService.GetListPagedAsync(
                offset,
                limit,
                limit,
                "Where MenuGroupId=@MenuGroupId and Name like @Query and IsDeleted=@IsDeleted ",
                "MenuOrder asc",
                new
                {
                    IsDeleted = false,
                    MenuGroupId = groupId,
                    Query = "%" + query + "%"
                });

            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Menu>>(501, e.Message);
        }
    }
    /// <summary>
    /// Admin: Get backend menus (for admin side navigation), paged.
    /// </summary>
    [HttpGet("backend")]

    public async Task<ActionResult<ApiResponse<IEnumerable<Menu>>>> GetBackendMenus(
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 50,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _menuService.MenuCrudService.GetListPagedAsync(
                offset,
                limit,
                limit,
                "Where IsBackend=@IsBackend and Name like @Query and IsDeleted=@IsDeleted ",
                "MenuOrder asc",
                new
                {
                    IsDeleted = false,
                    IsBackend = true,
                    Query = "%" + query + "%"
                });

            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Menu>>(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Get frontend menus (for website navigation), paged.
    /// </summary>
    [HttpGet("frontend")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Menu>>>> GetFrontendMenus(
        [FromQuery] int offset = 0,
        [FromQuery] int limit = 50,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _menuService.MenuCrudService.GetListPagedAsync(
                offset,
                limit,
                limit,
                "Where IsBackend=@IsBackend and Name like @Query and IsDeleted=@IsDeleted ",
                "MenuOrder asc",
                new
                {
                    IsDeleted = false,
                    IsBackend = false,
                    Query = "%" + query + "%"
                });

            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Menu>>(501, e.Message);
        }
    }

    #endregion

    #region Single menu + save + delete

    /// <summary>
    /// Admin: Get single menu with permissions by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<MenuViewModel>>> GetMenuById(int id)
    {
        try
        {
            var menu = await _menuService.MenuCrudService.GetAsync(
                "Where MenuId=@MenuId",
                new { MenuId = id });

            if (menu == null)
                return ErrorResponse<MenuViewModel>(404, "Menu not found");

            var permissions = await _menuService.PermissionCrudService.GetListAsync(
                "Where MenuId=@MenuId",
                new { MenuId = id });

            var model = menu.To<MenuViewModel>();
            model.Permissions = permissions.ToList();

            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<MenuViewModel>(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Save menu (create or update).
    /// POST: /api/v1/menu/save
    /// </summary>
    [HttpPost("save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveMenu([FromBody] MenuViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ErrorResponse<bool>(ModelState, 600, model);
        }

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
            {
                // If you require auth for saving menus, enforce here
                return NotAuthorizedResponse<bool>();
            }

            var status = await _menuService.SaveMenu(model);
            return SuccessResponse("Saved successfully", status > 0);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Soft-delete menu and its permissions.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteMenu(int id)
    {
        try
        {
            var result = await _menuService.MenuCrudService.DeleteAsync(id);
            await _menuService.PermissionCrudService.DeleteAsync(
                "Where MenuId=@MenuId",
                new { MenuId = id });

            return SuccessResponse("Deleted successfully", result > 0);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region Order / sort

    /// <summary>
    /// Admin: Save menu order (drag & drop sort).
    /// </summary>
    [HttpPost("order/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveMenuOrder(
        [FromBody] List<MenuOrderViewModel> orders)
    {
        if (orders == null || orders.Count == 0)
        {
            return ErrorResponse<bool>(600, "No order data provided");
        }

        try
        {
            var status = await _menuService.SaveMenuOrder(orders);
            return SuccessResponse("Order updated successfully", status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region Roles & Groups helpers

    /// <summary>
    /// Admin: Get roles for menu permission UI.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetRoles()
    {
        try
        {
            var roles = await _identityRoleService.RoleService.GetListAsync();
            var mapped = roles.Select(x => new { Id = x.Id, Name = x.Name });
            return SuccessResponse("Success", (object)mapped);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Get active menu groups.
    /// </summary>
    [HttpGet("groups")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MenuGroup>>>> GetGroups()
    {
        try
        {
            var groups = await _menuService.GroupCrudService.GetListAsync(
                "Where IsActive=@IsActive",
                new { IsActive = true });

            return SuccessResponse("Success", groups);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<MenuGroup>>(501, e.Message);
        }
    }
    [HttpPost("groups/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveMenuGropup([FromBody] MenuGroup model)
    {
        if (!ModelState.IsValid)
        {
            return ErrorResponse<bool>(ModelState, 600, model);
        }

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
            {
                // If you require auth for saving menus, enforce here
                return NotAuthorizedResponse<bool>();
            }
            model.AutoFill();
            if (model.MenuGroupId == 0)
            {


                var status = await _menuService.GroupCrudService.InsertAsync(model);
                return SuccessResponse("Saved successfully", status > 0);
            }
            else
            {
                var status = await _menuService.GroupCrudService.UpdateAsync(model);
                return SuccessResponse("Saved successfully", status);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpDelete("groups/delete/{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteMenuGroup(int id)
    {
        try
        {
            var result = await _menuService.GroupCrudService.DeleteAsync(id);
            await _menuService.MenuCrudService.DeleteAsync(
                "Where MenuGroupId=@MenuGroupId",
                new { MenuGroupId = id });

            return SuccessResponse("Deleted successfully", result > 0);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }
    #endregion

    #region Pattern A - Menu Item Management

    [HttpGet("item/{menuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<MenuViewModel>>> GetMenuItem(int menuId)
    {
        try
        {
            var menu = await _menuService.MenuCrudService.GetAsync(
                "Where MenuId=@MenuId",
                new { MenuId = menuId });

            if (menu == null)
                return ErrorResponse<MenuViewModel>(404, "Menu not found");

            var permissions = await _menuService.PermissionCrudService.GetListAsync(
                "Where MenuId=@MenuId",
                new { MenuId = menuId });

            var model = menu.To<MenuViewModel>();
            model.Permissions = permissions.ToList();

            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<MenuViewModel>(501, e.Message);
        }
    }

    [HttpGet("items")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Menu>>>> GetMenuItems([FromQuery] int? menuId)
    {
        try
        {
            if (menuId.HasValue)
            {
                var items = await _menuService.MenuCrudService.GetListAsync(
                    "Where MenuGroupId=@MenuGroupId and IsDeleted=@IsDeleted order by MenuOrder",
                    new { MenuGroupId = menuId.Value, IsDeleted = false });
                return SuccessResponse("Success", items);
            }

            var allItems = await _menuService.MenuCrudService.GetListAsync(
                "Where IsDeleted=@IsDeleted order by MenuGroupId, MenuOrder",
                new { IsDeleted = false });
            return SuccessResponse("Success", allItems);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Menu>>(501, e.Message);
        }
    }

    [HttpGet("children/{menuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Menu>>>> GetChildItems(int menuId, [FromQuery] int? parentId)
    {
        try
        {
            var items = await _menuService.MenuCrudService.GetListAsync(
                "Where MenuGroupId=@MenuGroupId and ParentId=@ParentId and IsDeleted=@IsDeleted order by MenuOrder",
                new { MenuGroupId = menuId, ParentId = parentId ?? 0, IsDeleted = false });
            return SuccessResponse("Success", items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Menu>>(501, e.Message);
        }
    }

    [HttpGet("check-title")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckChildMenuTitle([FromQuery] int menuId, [FromQuery] string title, [FromQuery] int? currentMenuId)
    {
        try
        {
            var existing = await _menuService.MenuCrudService.GetAsync(
                "Where MenuGroupId=@MenuGroupId and Name=@Name and IsDeleted=@IsDeleted",
                new { MenuGroupId = menuId, Name = title, IsDeleted = false });

            bool isUnique = existing == null || (currentMenuId.HasValue && existing.MenuId == currentMenuId.Value);
            return SuccessResponse("Success", isUnique);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("item/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<int>>> SaveMenuItem([FromBody] MenuViewModel request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<int>(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<int>();

            var id = await _menuService.SaveMenu(request);
            return SuccessResponse("Saved successfully", id);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<int>(501, e.Message);
        }
    }

    [HttpDelete("item/{menuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteMenuItem(int menuId)
    {
        try
        {
            var result = await _menuService.MenuCrudService.DeleteAsync(menuId);
            await _menuService.PermissionCrudService.DeleteAsync(
                "Where MenuId=@MenuId",
                new { MenuId = menuId });

            return SuccessResponse("Deleted successfully", result > 0);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("roles/{menuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<object>>> GetRoles(int menuId)
    {
        try
        {
            var roles = await _identityRoleService.RoleService.GetListAsync();
            var mapped = roles.Select(x => new { Id = x.Id, Name = x.Name });
            return SuccessResponse("Success", (object)mapped);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("users/{menuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<IEnumerable<MenuPermission>>>> GetUsers(int menuId, [FromQuery] int? roleId)
    {
        try
        {
            var users = await _menuService.PermissionCrudService.GetListAsync(
                "Where MenuId=@MenuId",
                new { MenuId = menuId });
            return SuccessResponse("Success", users);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<MenuPermission>>(501, e.Message);
        }
    }

    [HttpPost("user-perm/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveUserMenuPerm([FromQuery] int menuId, [FromQuery] string userId, [FromQuery] int? roleId)
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<bool>();

            await _menuService.PermissionCrudService.InsertAsync(new MenuPermission
            {
                MenuId = menuId,
                RoleId = roleId ?? 0,
                AllowAccess = true,
                IsActive = true
            });

            return SuccessResponse("Permission saved", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpDelete("user-perm/remove")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveUserMenuPerm([FromQuery] int menuId, [FromQuery] string userId, [FromQuery] int? roleId)
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<bool>();

            await _menuService.PermissionCrudService.DeleteAsync(
                "Where MenuId=@MenuId and RoleId=@RoleId",
                new { MenuId = menuId, RoleId = roleId ?? 0 });

            return SuccessResponse("Permission removed", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("sort")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SortOrder([FromQuery] int menuId, [FromQuery] int? parentId, [FromQuery] int? currentIndex, [FromQuery] int? targetIndex)
    {
        try
        {
            var success = await _menuService.SaveMenuOrder(new List<MenuOrderViewModel>
            {
                new MenuOrderViewModel { MenuId = menuId, MenuOrder = targetIndex ?? 0, ParentId = parentId ?? 0 }
            });

            return SuccessResponse("Order updated", success);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("copy/{sourceMenuId:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> CopyMenuItem(int sourceMenuId)
    {
        try
        {
            var source = await _menuService.MenuCrudService.GetAsync(
                "Where MenuId=@MenuId",
                new { MenuId = sourceMenuId });

            if (source == null)
                return ErrorResponse<bool>(404, "Source menu not found");

            source.MenuId = 0;
            source.AutoFill();
            source.Name = source.Name + " (Copy)";
            var newId = await _menuService.MenuCrudService.InsertAsync<int>(source);

            var permissions = await _menuService.PermissionCrudService.GetListAsync(
                "Where MenuId=@MenuId",
                new { MenuId = sourceMenuId });

            foreach (var perm in permissions)
            {
                perm.MenuPermissionId = 0;
                perm.MenuId = newId;
                perm.AutoFill();
                await _menuService.PermissionCrudService.InsertAsync<int>(perm);
            }

            return SuccessResponse("Copied successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion
}
