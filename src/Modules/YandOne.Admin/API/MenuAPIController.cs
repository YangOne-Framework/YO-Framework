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

    public async Task<IActionResult> GetMenuByGroup()
    {
        try
        {
           
            var data = await _menuService.GetSiteFrontendMenuForUser();

            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
    #region Lists

    /// <summary>
    /// Get admin navigation menus by user roles (calls usp_Menu_GetAdminAllByRole).
    /// </summary>
    [HttpGet("admin-menus")]
    public async Task<IActionResult> GetAdminMenusByRole()
    {
        try
        {
           

            var data = await _menuService.GetAdminMenusByRole(string.Join(',',User.Identity.GetRoles()));
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("group")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetMenuByGroup([FromQuery] int groupId = 0,
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
            return ErrorResponse(501, e.Message);
        }
    }
    /// <summary>
    /// Admin: Get backend menus (for admin side navigation), paged.
    /// </summary>
    [HttpGet("backend")]

    public async Task<IActionResult> GetBackendMenus(
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
            return ErrorResponse(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Get frontend menus (for website navigation), paged.
    /// </summary>
    [HttpGet("frontend")]
    public async Task<IActionResult> GetFrontendMenus(
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
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Single menu + save + delete

    /// <summary>
    /// Admin: Get single menu with permissions by id.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetMenuById(int id)
    {
        try
        {
            var menu = await _menuService.MenuCrudService.GetAsync(
                "Where MenuId=@MenuId",
                new { MenuId = id });

            if (menu == null)
                return ErrorResponse(404, "Menu not found");

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
            return ErrorResponse(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Save menu (create or update).
    /// POST: /api/v1/menu/save
    /// </summary>
    [HttpPost("save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveMenu([FromBody] MenuViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return ErrorResponse(ModelState, 600, model);
        }

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
            {
                // If you require auth for saving menus, enforce here
                return NotAuthorizedResponse();
            }

            var status = await _menuService.SaveMenu(model);
            return SuccessResponse("Saved successfully", new { Success = status > 0 });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    /// <summary>
    /// Admin: Soft-delete menu and its permissions.
    /// </summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteMenu(int id)
    {
        try
        {
            var result = await _menuService.MenuCrudService.DeleteAsync(id);
            await _menuService.PermissionCrudService.DeleteAsync(
                "Where MenuId=@MenuId",
                new { MenuId = id });

            return SuccessResponse("Deleted successfully", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Order / sort

    /// <summary>
    /// Admin: Save menu order (drag & drop sort).
    /// </summary>
    [HttpPost("order/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveMenuOrder(
        [FromBody] List<MenuOrderViewModel> orders)
    {
        if (orders == null || orders.Count == 0)
        {
            return ErrorResponse(600, "No order data provided");
        }

        try
        {
            var status = await _menuService.SaveMenuOrder(orders);
            return SuccessResponse("Order updated successfully", status);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Roles & Groups helpers

    /// <summary>
    /// Admin: Get roles for menu permission UI.
    /// </summary>
    [HttpGet("roles")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetRoles()
    {
        try
        {
            var roles = await _identityRoleService.RoleService.GetListAsync();
            var mapped = roles.Select(x => new { Id = x.Id, Name = x.Name });
            return SuccessResponse("Success", mapped);
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
    public async Task<IActionResult> GetGroups()
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
            return ErrorResponse(501, e.Message);
        }
    }
    [HttpPost("groups/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveMenuGropup([FromBody] MenuGroup model)
    {
        if (!ModelState.IsValid)
        {
            return ErrorResponse(ModelState, 600, model);
        }

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
            {
                // If you require auth for saving menus, enforce here
                return NotAuthorizedResponse();
            }
            model.AutoFill();
            if (model.MenuGroupId == 0)
            {


                var status = await _menuService.GroupCrudService.InsertAsync(model);
                return SuccessResponse("Saved successfully", new { Success = status > 0 });
            }
            else
            {
                var status = await _menuService.GroupCrudService.UpdateAsync(model);
                return SuccessResponse("Saved successfully", new { Success = status });
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpDelete("groups/delete/{id:int}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteMenuGroup(int id)
    {
        try
        {
            var result = await _menuService.GroupCrudService.DeleteAsync(id);
            await _menuService.MenuCrudService.DeleteAsync(
                "Where MenuGroupId=@MenuGroupId",
                new { MenuGroupId = id });

            return SuccessResponse("Deleted successfully", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
    #endregion
}