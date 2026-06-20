// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Storage;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Services;

namespace YandOne.Admin.API;

[Route("api/v1/smsserviceprovider")]
/// <summary>
/// Represents a class SmsServiceProviderApiController.
/// </summary>
public class SmsServiceProviderApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly ISMSService _smsService;
    private readonly IStorageProvider _storageProvider;

    public SmsServiceProviderApiController(
        ILogger logger,
        ISMSService smsService,
        IStorageProvider storageProvider)
    {
        _logger = logger;
        _smsService = smsService;
        _storageProvider = storageProvider;
    }

    [HttpGet("all")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SMSGateway>>>> GetAll(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _smsService.GatewayCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where Name like @Query and IsDeleted=@IsDeleted",
                    "AddedOn desc",
                    new { Query = "%" + query + "%", IsDeleted = false });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<SMSGateway>>(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<SMSGateway>>> GetById(int id)
    {
        try
        {
            var provider = await _smsService.GatewayCrudService.GetAsync(id);
            if (provider == null)
                return ErrorResponse<SMSGateway>(404, "SmsServiceProvider not found");

            return SuccessResponse("Success", provider);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SMSGateway>(501, e.Message);
        }
    }

    [HttpGet("default")]
    public async Task<ActionResult<ApiResponse<SMSGateway>>> GetDefault()
    {
        try
        {
            var provider = await _smsService.GetDefaultProviderAsync();
            return SuccessResponse("Success", provider);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<SMSGateway>(501, e.Message);
        }
    }

    [HttpGet("{id:int}/settings")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SMSGatewaySetting>>>> GetSettings(int id)
    {
        try
        {
            var settings = await _smsService.GetSettings(id);
            return SuccessResponse("Success", settings);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<SMSGatewaySetting>>(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiResponse<int>>> Save([FromForm] SMSGateway model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<int>();

            if (model.ImageFile != null)
            {
                model.Image = await _storageProvider.Save("SmsProvider", model.ImageFile);
            }

            var id = await _smsService.InsertOrSave(model);
            return SuccessResponse("Saved successfully", id);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<int>(501, e.Message);
        }
    }

    [HttpPost("set-default")]
    public async Task<ActionResult<ApiResponse<bool>>> SetDefault([FromBody] SetDefaultProviderRequest request)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var ok = await _smsService.SetDefaultProviderAsync(request.Id);
            return SuccessResponse("Default provider set successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("update-status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateStatus([FromBody] SMSGateway model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var ok = await _smsService.UpdateStatus(model);
            return SuccessResponse("Status updated successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("settings/update")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateSettings([FromBody] List<SMSGatewaySetting> settings)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            var ok = await _smsService.UpdateSettings(settings);
            return SuccessResponse("Settings updated successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
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

            var ok = await _smsService.DeleteSmsService(id);
            if (!ok)
                return ErrorResponse<bool>(400, "Cannot delete the default provider. Set another provider as default first.");
            return SuccessResponse("Deleted successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }
}

