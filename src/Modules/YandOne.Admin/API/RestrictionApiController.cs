using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/restriction")]
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
    public async Task<IActionResult> GetAllKeys(
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
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("key/{id:int}")]
    public async Task<IActionResult> GetKeyById(int id)
    {
        try
        {
            var key = await _restrictionService.KeyCrudService.GetAsync(id);
            if (key == null)
                return ErrorResponse(404, "RestrictionKey not found");

            return SuccessResponse("Success", key);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("key/save")]
    public async Task<IActionResult> SaveKey([FromBody] RestrictionKey model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();
            if (model.RestrictionKeyId == 0)
            {
                var id = await _restrictionService.KeyCrudService.InsertAsync<int>(model);
                return SuccessResponse("Saved successfully", new { RestrictionKeyId = id });
            }
            else
            {
                await _restrictionService.KeyCrudService.UpdateAsync(model);
                return SuccessResponse("Updated successfully", true);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpDelete("key/{id:int}")]
    public async Task<IActionResult> DeleteKey(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var key = await _restrictionService.KeyCrudService.GetAsync(id);
            if (key == null)
                return ErrorResponse(404, "RestrictionKey not found");

            if (key.IsSystem)
                return ErrorResponse(400, "System restriction keys cannot be deleted.");

            await _restrictionService.KeyCrudService.DeleteAsync(id);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll(
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
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var restriction = await _restrictionService.RestrictionCrudService.GetAsync(id);
            if (restriction == null)
                return ErrorResponse(404, "Restriction not found");

            return SuccessResponse("Success", restriction);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("by-key/{keyId:int}")]
    public async Task<IActionResult> GetByKeyId(
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
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] Restriction model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();
            if (model.RestrictionId == 0)
            {
                var id = await _restrictionService.RestrictionCrudService.InsertAsync<int>(model);
                return SuccessResponse("Saved successfully", new { RestrictionId = id });
            }
            else
            {
                await _restrictionService.RestrictionCrudService.UpdateAsync(model);
                return SuccessResponse("Updated successfully", true);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var restriction = await _restrictionService.RestrictionCrudService.GetAsync(id);
            if (restriction == null)
                return ErrorResponse(404, "Restriction not found");

            await _restrictionService.RestrictionCrudService.DeleteAsync(id);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    //[HttpGet("check/{keyName}/{value}")]
    //public async Task<IActionResult> CheckRestricted(string keyName, string value)
    //{
    //    try
    //    {
    //        var key = await _restrictionService.KeyCrudService.GetAsync(
    //            "Where Name=@Name and IsDeleted=@IsDeleted",
    //            new { Name = keyName, IsDeleted = false });
    //        if (key == null)
    //            return SuccessResponse("Not restricted", new { IsRestricted = false });

    //        var restriction = await _restrictionService.RestrictionCrudService.GetAsync(
    //            "Where RestrictionKeyId=@KeyId and Value=@Value and IsDeleted=@IsDeleted",
    //            new { KeyId = key.RestrictionKeyId, Value = value, IsDeleted = false });
    //        return SuccessResponse("Success", new { IsRestricted = restriction != null });
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpGet("grouped")]
    //public async Task<IActionResult> GetAllGroupedByKey()
    //{
    //    try
    //    {
    //        var keys = await _restrictionService.KeyCrudService.GetListAsync(
    //            "Where IsDeleted=@IsDeleted", new { IsDeleted = false });
    //        var result = new List<object>();
    //        foreach (var key in keys)
    //        {
    //            var restrictions = await _restrictionService.RestrictionCrudService.GetListAsync(
    //                "Where RestrictionKeyId=@KeyId and IsDeleted=@IsDeleted",
    //                new { KeyId = key.RestrictionKeyId, IsDeleted = false });
    //            result.Add(new { Key = key, Values = restrictions });
    //        }
    //        return SuccessResponse("Success", result);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    [HttpGet("admin-ip/all")]
    public async Task<IActionResult> GetAllAdminIps(
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
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("admin-ip/{id:int}")]
    public async Task<IActionResult> GetAdminIpById(int id)
    {
        try
        {
            var ipAccess = await _restrictionService.AdminIPAccessCrudService.GetAsync(id);
            if (ipAccess == null)
                return ErrorResponse(404, "AdministrativeIPAccess not found");

            return SuccessResponse("Success", ipAccess);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("admin-ip/save")]
    public async Task<IActionResult> SaveAdminIp([FromBody] AdministrativeIPAccess model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();
            if (model.AdministrativeIPAccessId == 0)
            {
                var id = await _restrictionService.AdminIPAccessCrudService.InsertAsync<int>(model);
                _restrictionService.InvalidateAdminIPAccessCache();
                return SuccessResponse("Saved successfully", new { AdministrativeIPAccessId = id });
            }
            else
            {
                await _restrictionService.AdminIPAccessCrudService.UpdateAsync(model);
                _restrictionService.InvalidateAdminIPAccessCache();
                return SuccessResponse("Updated successfully", true);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpDelete("admin-ip/{id:int}")]
    public async Task<IActionResult> DeleteAdminIp(int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ipAccess = await _restrictionService.AdminIPAccessCrudService.GetAsync(id);
            if (ipAccess == null)
                return ErrorResponse(404, "AdministrativeIPAccess not found");

            await _restrictionService.AdminIPAccessCrudService.DeleteAsync(id);
            _restrictionService.InvalidateAdminIPAccessCache();
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}
