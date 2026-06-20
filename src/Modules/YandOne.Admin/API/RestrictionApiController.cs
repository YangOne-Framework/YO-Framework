// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/restriction")]
/// <summary>
/// Represents a class RestrictionApiController.
/// </summary>
public class RestrictionApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IRestrictionService _restrictionService;

    public RestrictionApiController(
        ILogger logger,
        IRestrictionService restrictionService)
    {
        _logger = logger;
        _restrictionService = restrictionService;
    }

    [HttpGet("key/all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RestrictionKey>>>> GetAllKeys(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _restrictionService.KeyCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where Name like @Query and IsDeleted=@IsDeleted",
                    "AddedOn desc",
                    new { Query = "%" + query + "%", IsDeleted = false });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<RestrictionKey>>(501, e.Message);
        }
    }

    [HttpGet("key/{id:int}")]
    public async Task<ActionResult<ApiResponse<RestrictionKey>>> GetKeyById(int id)
    {
        try
        {
            var key = await _restrictionService.KeyCrudService.GetAsync(id);
            if (key == null)
                return ErrorResponse<RestrictionKey>(404, "RestrictionKey not found");

            return SuccessResponse("Success", key);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<RestrictionKey>(501, e.Message);
        }
    }

    [HttpPost("key/save")]
    public async Task<ActionResult<ApiResponse<int>>> SaveKey([FromBody] RestrictionKey model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<int>();

            model.AutoFill();
            if (model.RestrictionKeyId == 0)
            {
                var id = await _restrictionService.KeyCrudService.InsertAsync<int>(model);
                return SuccessResponse("Saved successfully", id);
            }
            else
            {
                await _restrictionService.KeyCrudService.UpdateAsync(model);
                return SuccessResponse("Updated successfully", 0);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<int>(501, e.Message);
        }
    }

    [HttpDelete("key/{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteKey(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var key = await _restrictionService.KeyCrudService.GetAsync(id);
            if (key == null)
                return ErrorResponse<bool>(404, "RestrictionKey not found");

            if (key.IsSystem)
                return ErrorResponse<bool>(400, "System restriction keys cannot be deleted.");

            await _restrictionService.KeyCrudService.DeleteAsync(id);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Restriction>>>> GetAll(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _restrictionService.RestrictionCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where (Value like @Query or Reason like @Query or Narration like @Query) and IsDeleted=@IsDeleted",
                    "AddedOn desc",
                    new { Query = "%" + query + "%", IsDeleted = false });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Restriction>>(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<Restriction>>> GetById(int id)
    {
        try
        {
            var restriction = await _restrictionService.RestrictionCrudService.GetAsync(id);
            if (restriction == null)
                return ErrorResponse<Restriction>(404, "Restriction not found");

            return SuccessResponse("Success", restriction);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Restriction>(501, e.Message);
        }
    }

    [HttpGet("by-key/{keyId:int}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Restriction>>>> GetByKeyId(
        int keyId,
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 50)
    {
        try
        {
            var data = await _restrictionService.RestrictionCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where RestrictionKeyId=@KeyId and IsDeleted=@IsDeleted",
                    "AddedOn desc",
                    new { KeyId = keyId, IsDeleted = false });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Restriction>>(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiResponse<int>>> Save([FromBody] Restriction model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<int>();

            model.AutoFill();
            if (model.RestrictionId == 0)
            {
                var id = await _restrictionService.RestrictionCrudService.InsertAsync<int>(model);
                return SuccessResponse("Saved successfully", id);
            }
            else
            {
                await _restrictionService.RestrictionCrudService.UpdateAsync(model);
                return SuccessResponse("Updated successfully", 0);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<int>(501, e.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var restriction = await _restrictionService.RestrictionCrudService.GetAsync(id);
            if (restriction == null)
                return ErrorResponse<bool>(404, "Restriction not found");

            await _restrictionService.RestrictionCrudService.DeleteAsync(id);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("admin-ip/all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AdministrativeIPAccess>>>> GetAllAdminIps(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _restrictionService.AdminIPAccessCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where IPV4Range like @Query or IPV6Range like @Query",
                    "AddedOn desc",
                    new { Query = "%" + query + "%" });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<AdministrativeIPAccess>>(501, e.Message);
        }
    }

    [HttpGet("admin-ip/{id:int}")]
    public async Task<ActionResult<ApiResponse<AdministrativeIPAccess>>> GetAdminIpById(int id)
    {
        try
        {
            var ipAccess = await _restrictionService.AdminIPAccessCrudService.GetAsync(id);
            if (ipAccess == null)
                return ErrorResponse<AdministrativeIPAccess>(404, "AdministrativeIPAccess not found");

            return SuccessResponse("Success", ipAccess);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<AdministrativeIPAccess>(501, e.Message);
        }
    }

    [HttpPost("admin-ip/save")]
    public async Task<ActionResult<ApiResponse<int>>> SaveAdminIp([FromBody] AdministrativeIPAccess model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<int>();

            model.AutoFill();
            if (model.AdministrativeIPAccessId == 0)
            {
                var id = await _restrictionService.AdminIPAccessCrudService.InsertAsync<int>(model);
                _restrictionService.InvalidateAdminIPAccessCache();
                return SuccessResponse("Saved successfully", id);
            }
            else
            {
                await _restrictionService.AdminIPAccessCrudService.UpdateAsync(model);
                _restrictionService.InvalidateAdminIPAccessCache();
                return SuccessResponse("Updated successfully", 0);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<int>(501, e.Message);
        }
    }

    [HttpDelete("admin-ip/{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteAdminIp(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var ipAccess = await _restrictionService.AdminIPAccessCrudService.GetAsync(id);
            if (ipAccess == null)
                return ErrorResponse<bool>(404, "AdministrativeIPAccess not found");

            await _restrictionService.AdminIPAccessCrudService.DeleteAsync(id);
            _restrictionService.InvalidateAdminIPAccessCache();
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }
}

