using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Dto;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/htmlcomponent")]
public class HtmlComponentAPIController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IHtmlComponentService _htmlComponentService;

    public HtmlComponentAPIController(ILogger logger, IHtmlComponentService htmlComponentService)
    {
        _logger = logger;
        _htmlComponentService = htmlComponentService;
    }
    [HttpGet]
    [Route("check/unique")]
    public async Task<IActionResult> CheckNameUnique(
        [FromQuery] string name,
        [FromQuery] string oldName,
        [FromQuery] int htmlComponentId = 0)
    {
        try
        {
            var isUnique = await _htmlComponentService.IsNameUniqueAsync(name, oldName, htmlComponentId);
            return SuccessResponse("Success", isUnique);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
    [HttpGet]
    [Route("all/active")]
    public async Task<IActionResult> GetAllActive(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _htmlComponentService.GetActivePagedAsync(offset, limit, query);
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet]
    [Route("all")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _htmlComponentService.GetAllPagedAsync(offset, limit, query);
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
            var item = await _htmlComponentService.GetByIdAsync(id);
            if (item == null)
                return ErrorResponse(404, "HtmlComponent not found");

            return SuccessResponse("Success", item);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost]
    [Route("save")]
    public async Task<IActionResult> Save([FromBody] HtmlComponentSaveRequest request)
    {
        if (!ModelState.IsValid)
        {
            return ErrorResponse(ModelState, 600, request);
        }

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
            {
                return NotAuthorizedResponse();
            }

            var saved = await _htmlComponentService.SaveAsync(request);
            return SuccessResponse("Saved successfully", saved);
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
            {
                return NotAuthorizedResponse();
            }

            var ok = await _htmlComponentService.DeleteAsync(id);
            if (!ok)
                return ErrorResponse(404, "HtmlComponent not found");

            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}