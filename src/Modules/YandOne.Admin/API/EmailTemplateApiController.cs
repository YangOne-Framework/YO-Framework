using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Storage;
using YangOne.Web.API;
using YangOne.Web.Model;

namespace YandOne.Admin.API;

[Route("api/v1/emailtemplate")]
public class EmailTemplateApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly IStorageProvider _storageProvider;

    public EmailTemplateApiController(
        ILogger logger,
        IEmailTemplateService emailTemplateService,
        IStorageProvider storageProvider)
    {
        _logger = logger;
        _emailTemplateService = emailTemplateService;
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
            var data = await _emailTemplateService.TemplateCRUDService
                .GetListPagedAsync(offset, limit, limit,
                    "Where IsDeleted=@IsDeleted and TemplateName like @Query",
                    "AddedOn desc",
                    new { IsDeleted = false, Query = "%" + query + "%" });
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
            var template = await _emailTemplateService.TemplateCRUDService.GetAsync(id);
            if (template == null)
                return ErrorResponse(404, "EmailTemplate not found");

            return SuccessResponse("Success", template);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("{id:int}/full")]
    public async Task<IActionResult> GetFullTemplate(int id)
    {
        try
        {
            var template = await _emailTemplateService.TemplateCRUDService.GetAsync(id);
            if (template == null)
                return ErrorResponse(404, "EmailTemplate not found");

            var full = _emailTemplateService.CombineTemplate(template);
            return SuccessResponse("Success", new { template.TemplateId, template.TemplateName, FullHtml = full });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("defaults")]
    public async Task<IActionResult> GetDefaults()
    {
        try
        {
            var header = await _emailTemplateService.GetDefaultHeaderTemplate();
            var footer = await _emailTemplateService.GetDefaultFooterTemplate();
            return SuccessResponse("Success", new
            {
                Header = header?.Template ?? "",
                Footer = footer?.Template ?? ""
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] EmailTemplate model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var existing = await _emailTemplateService.TemplateCRUDService.GetAsync(
                "Where TemplateName=@Name and IsDeleted=@Deleted",
                new { Name = model.TemplateName, Deleted = false });
            if (existing != null && existing.TemplateId != model.TemplateId)
                return ValidationResponse(new List<string> { "A template with this name already exists." });

            model.AutoFill();
            await _emailTemplateService.SaveEmailTemplate(model);
            return SuccessResponse("Saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var files = Request.Form.Files;
            if (files == null || files.Count == 0)
                return ErrorResponse(400, "No file uploaded.");

            var path = await _storageProvider.Save("SEO", files[0]);
            return SuccessResponse("Uploaded successfully", path);
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

            var template = await _emailTemplateService.TemplateCRUDService.GetAsync(id);
            if (template == null)
                return ErrorResponse(404, "EmailTemplate not found");

            if (template.TemplateType?.ToLower() == "sys")
                return ErrorResponse(400, "System templates cannot be deleted.");

            if (template.TemplateName is "_HEADER" or "_FOOTER")
                return ErrorResponse(400, "Core structural templates cannot be deleted.");

            await _emailTemplateService.TemplateCRUDService.DeleteAsync(id);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}
