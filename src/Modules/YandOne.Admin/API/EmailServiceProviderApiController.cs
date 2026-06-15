using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Storage;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Services;

namespace YandOne.Admin.API;

[Route("api/v1/emailserviceprovider")]
public class EmailServiceProviderApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IEmailServiceProviderService _emailServiceProviderService;
    private readonly IStorageProvider _storageProvider;

    public EmailServiceProviderApiController(
        ILogger logger,
        IEmailServiceProviderService emailServiceProviderService,
        IStorageProvider storageProvider)
    {
        _logger = logger;
        _emailServiceProviderService = emailServiceProviderService;
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
            var data = await _emailServiceProviderService.ProviderCrudService
                .GetListPagedAsync(offset, limit, limit,
                    "Where Name like @Query",
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

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var provider = await _emailServiceProviderService.ProviderCrudService.GetAsync(id);
            if (provider == null)
                return ErrorResponse(404, "EmailServiceProvider not found");

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
            var provider = await _emailServiceProviderService.GetDefaultProviderAsync();
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
            var settings = await _emailServiceProviderService.GetSettings(id);
            return SuccessResponse("Success", settings);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromForm] EmailServiceProvider model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (model.ImageFile != null)
            {
                model.Image = await _storageProvider.Save("EmailProvider", model.ImageFile);
            }

            var id = await _emailServiceProviderService.InsertOrSave(model);
            return SuccessResponse("Saved successfully", new { EmailServiceProviderId = id });
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

            var ok = await _emailServiceProviderService.SetDefaultProviderAsync(request.Id);
            return SuccessResponse("Default provider set successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("update-status")]
    public async Task<IActionResult> UpdateStatus([FromBody] EmailServiceProvider model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _emailServiceProviderService.UpdateStatus(model);
            return SuccessResponse("Status updated successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("settings/update")]
    public async Task<IActionResult> UpdateSettings([FromBody] List<EmailServiceProviderSetting> settings)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _emailServiceProviderService.UpdateSettings(settings);
            return SuccessResponse("Settings updated successfully", ok);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var ok = await _emailServiceProviderService.DeleteEmailService(name);
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
