using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Dto;
using YangOne.Identity.Extensions;
using YangOne.Identity.Service;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/permission")]
public class PermissionApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IPermissionService _permissionService;
    private readonly IIdentityRoleService _identityRoleService;

    public PermissionApiController(
        ILogger logger,
        IPermissionService permissionService,
        IIdentityRoleService identityRoleService)
    {
        _logger = logger;
        _permissionService = permissionService;
        _identityRoleService = identityRoleService;
    }

   
    [HttpGet("role/{roleId:int}")]
    [Authorize(Roles = "Admin,SuperUser")]
    public async Task<IActionResult> GetRolePermissions([FromRoute] int roleId)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var roles = await GetRoles(); // excludes role Id=1 as in your MVC code
            var rolePermission = await _permissionService.GetRolePermissionsById(roleId);

            return SuccessResponse("Success", new
            {
                Roles = roles,
                RolePermission = rolePermission
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    
    [HttpPost("role/{roleId:int}/save")]
    [Authorize(Roles = "Admin,SuperUser")]
    public async Task<IActionResult> SaveRolePermissions(
        [FromRoute] int roleId,
        [FromBody] RolePermissionViewModel rolePermissions)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, rolePermissions);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            // Safety: ensure route roleId matches payload role id (when present)
            var payloadRoleId = rolePermissions?.RolePermission?.FirstOrDefault()?.RoleId ?? 0;
            if (payloadRoleId != 0 && payloadRoleId != roleId)
                return ErrorResponse(400, "RoleId in route does not match RoleId in payload.");

            await _permissionService.SaveRolePermissions(rolePermissions);

            return SuccessResponse("Permissions saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpGet("role/all")]
    [Authorize(Roles = "Admin,SuperUser")]
    public async Task<IActionResult> GetRolesList()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var roles = await GetRoles();
            return SuccessResponse("Success", roles);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [NonAction]
    internal async Task<List<UserRolesSelected>> GetRoles(List<int>? roleIds = null)
    {
        var allRoles = await _identityRoleService.RoleService.GetListAsync();
        var roles = allRoles.Where(x => x.Id != 1);

        return roles.Select(r => new UserRolesSelected
        {
            RoleId = (int)r.Id,
            IsSelected = roleIds != null && roleIds.Contains((int)r.Id),
            Name = r.Name
        }).ToList();
    }
}

