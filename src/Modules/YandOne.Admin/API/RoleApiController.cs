using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Extension;
using YangOne.Identity.Model;
using YangOne.Identity.Service;
using YangOne.Log;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/role")]
public class RoleApiController : BaseApiController
{/// <summary>
    /// API controller for managing identity roles.
    /// Provides endpoints to list, save, and delete roles.
    /// </summary>
    private readonly ILogger _logger;
    private readonly IIdentityRoleService _identityRoleService;
    /// <summary>
    /// Constructor for RoleApiController with dependency injection.
    /// </summary>
    /// <param name="logger">Logger service for error and info logging.</param>
    /// <param name="identityRoleService">Service to handle identity role operations.</param>

    public RoleApiController(ILogger logger, IIdentityRoleService identityRoleService)
    {
        _logger = logger;
        _identityRoleService = identityRoleService;
    }

    [Route("all")]
    [HttpGet]
    public async Task<dynamic> GetAllRoles(string query = "", int offset = 1, int limit = 10)
    {
        try
        {

            var roles =
                await _identityRoleService.RoleService.GetListPagedAsync(
                    offset, limit, limit
                    , "Where IsDeleted=@IsDeleted and Name like @Name", "Name asc", new { IsDeleted = false, Name = "%" + query + "%" });

            return HttpResponse((int)HttpStatusCode.OK, "success", roles);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse((int)HttpStatusCode.InternalServerError, e.Message);
        }
    }

    [Route("{id:int}")]
    [HttpGet]
    public async Task<dynamic> GetRoleById(int id)
    {
        try
        {
            var role = await _identityRoleService.RoleService.GetAsync(id);
            if (role == null)
                return ErrorResponse(404, "Role not found.");
            return HttpResponse((int)HttpStatusCode.OK, "success", role);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse((int)HttpStatusCode.InternalServerError, e.Message);
        }
    }
    [Route("save")]
    /// <summary>
    /// POST /api/v1/role/save
    /// Saves a new role or updates an existing role.
    /// </summary>
    /// <param name="role">IdentityRole object containing role details.</param>
    /// <returns>HTTP response indicating success or validation errors.</returns>
    [HttpPost]
    public async Task<dynamic> SaveRole(IdentityRole role)
    {
        try
        {
            if (ModelState.IsValid)
            {
                if (role.Id == 0)
                {
                    role.AutoFill();
                    await _identityRoleService.RoleService.InsertAsync(role);
                }
                else
                {
                    role.AutoFill();
                    await _identityRoleService.RoleService.UpdateAsync(role);
                }

                return HttpResponse((int)HttpStatusCode.OK, "success", true);
            }
            else
            {
                return ValidationResponse(ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage)
                    .ToList());
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse((int)HttpStatusCode.InternalServerError, e.Message);
        }
    }
    [Route("delete")]
    /// <summary>
    /// POST /api/v1/role/delete
    /// Deletes a role by ID. System roles cannot be deleted.
    /// </summary>
    /// <param name="role">IdentityRole object containing the role ID to delete.</param>
    /// <returns>HTTP response indicating success, failure, or restriction for system roles.</returns>
    [HttpPost]
    public async Task<dynamic> Delete(IdentityRole role)
    {
        try
        {

            if (role.Id == 0)
            {
                return HttpResponse((int)HttpStatusCode.OK, "success", false);
            }
            else
            {
                var r = await _identityRoleService.RoleService.GetAsync(role.Id);
                if (r.IsSystem)
                {
                    return HttpResponse(500, "System roles can not be deleted.", false);
                }

                await _identityRoleService.RoleService.DeleteAsync(role.Id);
            }
            return HttpResponse((int)HttpStatusCode.OK, "success", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse((int)HttpStatusCode.InternalServerError, e.Message);
        }
    }
}