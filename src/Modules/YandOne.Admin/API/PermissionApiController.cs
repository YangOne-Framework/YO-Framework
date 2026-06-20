// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Dto;
using YangOne.Identity.Extensions;
using YangOne.Identity.Service;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Admin.Dto;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/permission")]
/// <summary>
/// Represents a class PermissionApiController.
/// </summary>
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
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<RolePermissionsDto>>> GetRolePermissions([FromRoute] int roleId)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<RolePermissionsDto>();

            var roles = await GetRoles();
            var rolePermission = await _permissionService.GetRolePermissionsById(roleId);

            return SuccessResponse("Success", new RolePermissionsDto(roles, rolePermission));
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<RolePermissionsDto>(501, e.Message);
        }
    }

    
    [HttpPost("role/{roleId:int}/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveRolePermissions(
        [FromRoute] int roleId,
        [FromBody] RolePermissionViewModel rolePermissions)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<bool>(ModelState, 600, rolePermissions);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            // Safety: ensure route roleId matches payload role id (when present)
            var payloadRoleId = rolePermissions?.RolePermission?.FirstOrDefault()?.RoleId ?? 0;
            if (payloadRoleId != 0 && payloadRoleId != roleId)
                return ErrorResponse<bool>(400, "RoleId in route does not match RoleId in payload.");

            await _permissionService.SaveRolePermissions(rolePermissions);

            return SuccessResponse("Permissions saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    
    [HttpGet("role/all")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<List<UserRolesSelected>>>> GetRolesList()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<List<UserRolesSelected>>();

            var roles = await GetRoles();
            return SuccessResponse("Success", roles);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<UserRolesSelected>>(501, e.Message);
        }
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetMyPermissions()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<List<string>>();

            var permissions = await _permissionService.GetMyPermissions(userId);
            return SuccessResponse("Success", permissions.ToList());
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<string>>(501, e.Message);
        }
    }

    [HttpGet("user/{userId:long}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<List<UserPermission>>>> GetUserPermissions([FromRoute] long userId)
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<List<UserPermission>>();

            var userPermissions = await _permissionService.GetUserPermissionsById(userId);
            return SuccessResponse("Success", userPermissions.ToList());
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<UserPermission>>(501, e.Message);
        }
    }

    [HttpPost("user/{userId:long}/save")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveUserPermissions(
        [FromRoute] long userId,
        [FromBody] UserPermissionViewModel userPermissions)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<bool>(ModelState, 600, userPermissions);

        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<bool>();

            foreach (var item in userPermissions.UserPermission)
            {
                item.UserId = userId;
            }

            await _permissionService.SaveUserPermissions(userPermissions);
            return SuccessResponse("User permissions saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
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


