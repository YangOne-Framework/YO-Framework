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
    public async Task<IActionResult> GetAll(
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
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var provider = await _smsService.GatewayCrudService.GetAsync(id);
            if (provider == null)
                return ErrorResponse(404, "SmsServiceProvider not found");

            return SuccessResponse("Success", provider);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("default")]
    public async Task<IActionResult> GetDefault()
    {
        try
        {
            var provider = await _smsService.GetDefaultProviderAsync();
            return SuccessResponse("Success", provider);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("{id:int}/settings")]
    public async Task<IActionResult> GetSettings(int id)
    {
        try
        {
            var settings = await _smsService.GetSettings(id);
            return SuccessResponse("Success", settings);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromForm] SMSGateway model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (model.ImageFile != null)
            {
                model.Image = await _storageProvider.Save("SmsProvider", model.ImageFile);
            }

            var id = await _smsService.InsertOrSave(model);
            return SuccessResponse("Saved successfully", new { SMSGatewayId = id });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("set-default")]
    public async Task<IActionResult> SetDefault([FromBody] SetDefaultProviderRequest request)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _smsService.SetDefaultProviderAsync(request.Id);
            return SuccessResponse("Default provider set successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("update-status")]
    public async Task<IActionResult> UpdateStatus([FromBody] SMSGateway model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _smsService.UpdateStatus(model);
            return SuccessResponse("Status updated successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("settings/update")]
    public async Task<IActionResult> UpdateSettings([FromBody] List<SMSGatewaySetting> settings)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _smsService.UpdateSettings(settings);
            return SuccessResponse("Settings updated successfully", ok);
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

            var ok = await _smsService.DeleteSmsService(id);
            if (!ok)
                return ErrorResponse(400, "Cannot delete the default provider. Set another provider as default first.");
            return SuccessResponse("Deleted successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}
