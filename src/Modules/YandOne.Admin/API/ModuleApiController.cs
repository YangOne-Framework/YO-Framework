using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Module;

namespace YandOne.Admin.API;

[Route("api/v1/module")]
public class ModuleApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IModuleManager _moduleManager;
    private readonly IModuleService _moduleService;

    public ModuleApiController(
        ILogger logger,
        IModuleManager moduleManager,
        IModuleService moduleService)
    {
        _logger = logger;
        _moduleManager = moduleManager;
        _moduleService = moduleService;
    }

    // GET: api/v1/modules?pageNo=1&pageSize=8&status=1&query=
    [HttpGet]
    [Route("all")]
    [Authorize(Roles = "Admin,SuperAdmin")]

    // If your Service supports filters, expose them; otherwise keep minimal.
    public async Task<IActionResult> GetPaged(
        [FromQuery] int pageNo = 1,
        [FromQuery] int pageSize = 8,
        [FromQuery] int status = 1,
        [FromQuery] string query = "")
    {
        try
        {
            var data = await _moduleService.Service.GetListPagedAsync(pageNo, pageSize, status, query, "", new { });
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("install")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Install( ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (string.IsNullOrWhiteSpace(request.ModuleName))
                return ErrorResponse(400, "Invalid module.");

            var module = await _moduleManager.FindAsync(request.ModuleName);
            if (module == null)
                return ErrorResponse(404, "Module not found.");

            var ok = await _moduleManager.InstallAsync(module);

            if (!ok)
                return ErrorResponse(500, "Module installation failed.");

            return SuccessResponse("Module installed successfully.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("uninstall")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Uninstall(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (string.IsNullOrWhiteSpace(request.ModuleName))
                return ErrorResponse(400, "Invalid module.");

            var module = await _moduleManager.FindAsync(request.ModuleName);
            if (module == null)
                return ErrorResponse(404, "Module not found.");

            var ok = await _moduleManager.UnInstallAsync(module);

            if (!ok)
                return ErrorResponse(500, "Module uninstallation failed.");

            return SuccessResponse("Module uninstalled successfully.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}


