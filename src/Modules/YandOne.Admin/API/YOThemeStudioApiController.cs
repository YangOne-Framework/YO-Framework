using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.API;

namespace YandOne.Admin.API;

/// <summary>
/// YOTheme Studio API (blueprint §68) — lifecycle, compile, publish,
/// assignments, runtime resolution and studio satellite resources.
/// Admin surface requires the platform admin roles; only the anonymous
/// runtime endpoints (<c>resolve</c>, <c>css</c>) opt back out explicitly.
/// </summary>
[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/v1/yotheme-studio")]
public class YOThemeStudioApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IYOThemeStudioService _studioService;
    private readonly string _themesRoot;
    private readonly string? _webRoot;

    public YOThemeStudioApiController(ILogger logger, IYOThemeStudioService studioService, IWebHostEnvironment env)
    {
        _logger = logger;
        _studioService = studioService;
        _themesRoot = Path.Combine(env.ContentRootPath, "Themes");
        _webRoot = env.WebRootPath;
    }

    private string ClientIp => HttpContext?.Connection?.RemoteIpAddress?.ToString();

    // ── Theme CRUD (blueprint §68) ────────────────────────

    [HttpGet("themes")]
    public async Task<ActionResult<ApiResponse<List<YOThemeListItem>>>> ListThemes(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string search = "",
        [FromQuery] string status = "all")
    {
        try
        {
            var result = await _studioService.ListThemesAsync(offset, limit, search, status);
            if (!result.Success)
                return ErrorResponse<List<YOThemeListItem>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeListItem>>(501, e.Message);
        }
    }

    [HttpGet("themes/active")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> GetActiveTheme()
    {
        try
        {
            var result = await _studioService.GetActiveThemeAsync();
            if (!result.Success || result.Data == null)
                return SuccessResponse<YOTheme>("No active theme", null);

            return SuccessResponse(result.Message, (YOTheme)result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpGet("themes/{guid}")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> GetTheme(string guid)
    {
        try
        {
            var result = await _studioService.GetConfigAsync(guid);
            if (!result.Success || result.Data is not YOTheme theme)
                return ErrorResponse<YOTheme>(404, result.Message);

            return SuccessResponse(result.Message, theme);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpPost("themes")]
    public async Task<ActionResult<ApiResponse<object>>> CreateTheme([FromBody] YOThemeSaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return ErrorResponse<object>(600, "Invalid request");

            var result = await _studioService.CreateThemeAsync(request, ClientIp);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    /// <summary>Portable package as a ZIP archive: theme.json + assets/** files.
    /// Asset URLs inside the config are rewritten to relative "assets/..." keys.</summary>
    [HttpGet("themes/{guid}/package")]
    public async Task<IActionResult> ExportThemeZip(string guid)
    {
        try
        {
            var themeResult = await _studioService.GetConfigAsync(guid);
            if (!themeResult.Success || themeResult.Data is not YOTheme theme)
                return NotFound(CreateResponse<object>(404, "Theme not found", null));

            var assetResult = await _studioService.ListAssetsAsync(guid);
            var export = YOThemePackageZip.Export(
                theme,
                assetResult.Data ?? new List<YOThemeAsset>(),
                _themesRoot,
                _webRoot);

            Response.Headers["X-Missing-Assets"] = export.MissingFiles.Count.ToString();
            return File(export.Zip, "application/zip", export.FileName);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return StatusCode(501, CreateResponse<object>(501, e.Message, null, new[] { e.Message }));
        }
    }

    /// <summary>Import a .yo-theme.zip produced by ExportThemeZip (or hand-packed):
    /// verifies the SHA-256 signature, installs asset files under Themes/{slug}/
    /// (served at /themes/{slug}/...), rewrites config references and re-creates
    /// asset rows.</summary>
    [HttpPost("themes/import-zip")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<object>>> ImportThemeZip(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return ErrorResponse<object>(600, "A .zip package file is required");

            using var stream = file.OpenReadStream();
            var allowUnsigned = Request.Query["allowUnsigned"].ToString() == "true";
            var result = await YOThemePackageZip.ImportAsync(
                stream,
                _themesRoot,
                async (request) =>
                {
                    var created = await _studioService.CreateThemeAsync(request, ClientIp);
                    var guid = (created.Data as dynamic)?.YOThemeUniqueId?.ToString();
                    return (created.Success, guid, created.Message);
                },
                async (assetRequest) => (await _studioService.SaveAssetAsync(assetRequest)).Success,
                allowUnsigned);

            if (!result.Success)
                return ErrorResponse<object>(600, result.Message);

            PublicPageCache.InvalidatePage();
            return SuccessResponse<object>(result.Message, new
            {
                YOThemeUniqueId = result.YOThemeUniqueId,
                InstalledFiles = result.InstalledFiles,
                Warnings = result.Warnings
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("themes/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTheme(string guid, [FromQuery] bool cascadeLayouts = false)
    {
        try
        {
            var result = await _studioService.DeleteThemeAsync(guid, cascadeLayouts);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Config ────────────────────────────────────────────

    [AllowAnonymous]
    [HttpGet("config/{guid}")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> GetConfig(string guid)
    {
        try
        {
            var result = await _studioService.GetConfigAsync(guid);
            if (!result.Success)
                return ErrorResponse<YOTheme>(404, result.Message);

            return SuccessResponse(result.Message, (YOTheme)result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpPut("config/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> SaveConfig(string guid, [FromBody] YOThemeConfigSaveRequest request)
    {
        try
        {
            request.YOThemeUniqueId = guid;
            var result = await _studioService.SaveConfigAsync(request, ClientIp);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Compile / validate ────────────────────────────────

    [HttpPost("compile")]
    public async Task<ActionResult<ApiResponse<YOThemeCompileResult>>> Compile([FromBody] YOThemeCompileRequest request)
    {
        try
        {
            var result = await _studioService.CompileAsync(request);
            return SuccessResponse(result.Message, result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOThemeCompileResult>(501, e.Message);
        }
    }

    [HttpPost("validate")]
    public async Task<ActionResult<ApiResponse<List<YOThemeValidationItem>>>> Validate([FromBody] YOThemeValidateRequest request)
    {
        try
        {
            var compile = await _studioService.CompileAsync(new YOThemeCompileRequest
            {
                YOThemeUniqueId = request.YOThemeUniqueId,
                Config = request.Config
            });
            return SuccessResponse(compile.Message, compile.Validation);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeValidationItem>>(501, e.Message);
        }
    }

    [HttpGet("validation/{guid}")]
    public async Task<ActionResult<ApiResponse<List<YOThemeValidationEntry>>>> GetValidation(string guid)
    {
        try
        {
            var result = await _studioService.GetValidationAsync(guid);
            if (!result.Success)
                return ErrorResponse<List<YOThemeValidationEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeValidationEntry>>(501, e.Message);
        }
    }

    // ── Lifecycle ─────────────────────────────────────────

    [HttpPost("status")]
    public async Task<ActionResult<ApiResponse<object>>> SetStatus([FromBody] YOThemeStatusRequest request)
    {
        try
        {
            var result = await _studioService.SetStatusAsync(request, ClientIp);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            PublicPageCache.InvalidatePage();
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("publish")]
    public async Task<ActionResult<ApiResponse<object>>> Publish([FromBody] YOThemePublishRequest request)
    {
        try
        {
            var result = await _studioService.PublishAsync(request, ClientIp);
            if (!result.Success)
                return ErrorResponse(result.Action == "validation_failed" ? 600 : 501, result.Message, result.Data);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("set-default/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> SetDefault(string guid)
    {
        try
        {
            var result = await _studioService.SetDefaultAsync(guid, ClientIp);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("duplicate")]
    public async Task<ActionResult<ApiResponse<object>>> Duplicate([FromBody] YOThemeDuplicateRequest request)
    {
        try
        {
            var result = await _studioService.DuplicateAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Runtime resolution (public — blueprint §21) ───────

    [HttpGet("resolve")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<YOThemeResolveResponse>>> Resolve(
        [FromQuery] string application = null,
        [FromQuery] string targetType = null,
        [FromQuery] string targetKey = null,
        [FromQuery] string route = null,
        [FromQuery] string mode = null)
    {
        try
        {
            var resolved = await _studioService.ResolveAsync(
                targetType ?? "application",
                targetKey ?? application,
                route);

            if (resolved == null)
                return SuccessResponse<YOThemeResolveResponse>("No theme resolved", null);

            return SuccessResponse("Success", resolved);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOThemeResolveResponse>(501, e.Message);
        }
    }

    /// <summary>Published theme CSS for runtime loaders (blueprint §21).</summary>
    [HttpGet("css")]
    [AllowAnonymous]
    [ResponseCache(Duration = 300, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> Css(
        [FromQuery] string application = null,
        [FromQuery] string targetType = null,
        [FromQuery] string targetKey = null,
        [FromQuery] string route = null,
        [FromQuery] string theme = null)
    {
        try
        {
            var css = await _studioService.GetPublishedCssAsync(targetType ?? "application", targetKey ?? application, route, theme);
            if (css == null)
                return NotFound(CreateResponse<object>(404, "No theme resolved", null));

            return Content(css, "text/css");
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return StatusCode(501, CreateResponse<object>(501, e.Message, null, new[] { e.Message }));
        }
    }

    // ── Assignments ───────────────────────────────────────

    [HttpGet("assignments")]
    public async Task<ActionResult<ApiResponse<List<YOThemeAssignmentEntry>>>> ListAssignments([FromQuery] string theme = null)
    {
        try
        {
            var result = await _studioService.ListAssignmentsAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeAssignmentEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeAssignmentEntry>>(501, e.Message);
        }
    }

    [HttpPost("assignments")]
    public async Task<ActionResult<ApiResponse<object>>> SaveAssignment([FromBody] YOThemeAssignmentSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveAssignmentAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("assignments/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAssignment(long id)
    {
        try
        {
            var result = await _studioService.DeleteAssignmentAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Brand kits ────────────────────────────────────────

    [HttpGet("brand-kits")]
    public async Task<ActionResult<ApiResponse<List<YOBrandKit>>>> ListBrandKits()
    {
        try
        {
            var result = await _studioService.ListBrandKitsAsync();
            if (!result.Success)
                return ErrorResponse<List<YOBrandKit>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOBrandKit>>(501, e.Message);
        }
    }

    [HttpPost("brand-kits")]
    public async Task<ActionResult<ApiResponse<object>>> SaveBrandKit([FromBody] YOBrandKitSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveBrandKitAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("brand-kits/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBrandKit(long id)
    {
        try
        {
            var result = await _studioService.DeleteBrandKitAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Layouts / templates / scopes ──────────────────────

    [HttpGet("layouts")]
    public async Task<ActionResult<ApiResponse<List<YOThemeLayoutEntry>>>> ListLayouts([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListLayoutsAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeLayoutEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeLayoutEntry>>(501, e.Message);
        }
    }

    [HttpPost("layouts")]
    public async Task<ActionResult<ApiResponse<object>>> SaveLayout([FromBody] YOThemeLayoutSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveLayoutAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("layouts/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteLayout(long id)
    {
        try
        {
            var result = await _studioService.DeleteLayoutAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("templates")]
    public async Task<ActionResult<ApiResponse<List<YOThemeTemplateEntry>>>> ListTemplates([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListTemplatesAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeTemplateEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeTemplateEntry>>(501, e.Message);
        }
    }

    [HttpPost("templates")]
    public async Task<ActionResult<ApiResponse<object>>> SaveTemplate([FromBody] YOThemeTemplateSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveTemplateAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("templates/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTemplate(long id)
    {
        try
        {
            var result = await _studioService.DeleteTemplateAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("scopes")]
    public async Task<ActionResult<ApiResponse<List<YOThemeScopedStyleEntry>>>> ListScopes([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListScopesAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeScopedStyleEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeScopedStyleEntry>>(501, e.Message);
        }
    }

    [HttpPost("scopes")]
    public async Task<ActionResult<ApiResponse<object>>> SaveScope([FromBody] YOThemeScopedStyleSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveScopeAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("scopes/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteScope(long id)
    {
        try
        {
            var result = await _studioService.DeleteScopeAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Components ────────────────────────────────────────

    [HttpGet("registry")]
    public async Task<ActionResult<ApiResponse<List<YOComponentRegistryEntry>>>> ListRegistry()
    {
        try
        {
            var result = await _studioService.ListRegistryAsync();
            if (!result.Success)
                return ErrorResponse<List<YOComponentRegistryEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOComponentRegistryEntry>>(501, e.Message);
        }
    }

    [HttpGet("components")]
    public async Task<ActionResult<ApiResponse<List<YOThemeComponentEntry>>>> ListThemeComponents([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListThemeComponentsAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeComponentEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeComponentEntry>>(501, e.Message);
        }
    }

    [HttpPost("components")]
    public async Task<ActionResult<ApiResponse<object>>> SaveThemeComponent([FromBody] YOThemeComponentSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveThemeComponentAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Assets ────────────────────────────────────────────

    [HttpGet("assets")]
    public async Task<ActionResult<ApiResponse<List<YOThemeAsset>>>> ListAssets([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListAssetsAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeAsset>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeAsset>>(501, e.Message);
        }
    }

    [HttpPost("assets")]
    public async Task<ActionResult<ApiResponse<object>>> SaveAsset([FromBody] YOThemeAssetSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveAssetAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("assets/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteAsset(long id)
    {
        try
        {
            var result = await _studioService.DeleteAssetAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Governance: review queue / approvals / comments ───

    [HttpGet("review-queue")]
    public async Task<ActionResult<ApiResponse<List<YOThemeReviewQueueItem>>>> ReviewQueue()
    {
        try
        {
            var result = await _studioService.ListReviewQueueAsync();
            if (!result.Success)
                return ErrorResponse<List<YOThemeReviewQueueItem>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeReviewQueueItem>>(501, e.Message);
        }
    }

    [HttpGet("approvals")]
    public async Task<ActionResult<ApiResponse<List<YOThemeApprovalEntry>>>> ListApprovals([FromQuery] string theme)
    {
        try
        {
            var result = await _studioService.ListApprovalsAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeApprovalEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeApprovalEntry>>(501, e.Message);
        }
    }

    [HttpPost("approvals/review")]
    public async Task<ActionResult<ApiResponse<object>>> Review([FromBody] YOThemeApprovalSaveRequest request)
    {
        try
        {
            var result = await _studioService.ReviewAsync(request, User.Identity.GetIdentityUserId(), ClientIp);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            PublicPageCache.InvalidatePage();
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("comments")]
    public async Task<ActionResult<ApiResponse<List<YOThemeCommentEntry>>>> ListComments([FromQuery] string theme, [FromQuery] bool includeResolved = false)
    {
        try
        {
            var result = await _studioService.ListCommentsAsync(theme, includeResolved);
            if (!result.Success)
                return ErrorResponse<List<YOThemeCommentEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeCommentEntry>>(501, e.Message);
        }
    }

    [HttpPost("comments")]
    public async Task<ActionResult<ApiResponse<object>>> SaveComment([FromBody] YOThemeCommentSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveCommentAsync(request, User.Identity.GetIdentityUserId());
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("comments/{id:long}/resolve")]
    public async Task<ActionResult<ApiResponse<object>>> ResolveComment(long id)
    {
        try
        {
            var result = await _studioService.ResolveCommentAsync(id, User.Identity.GetIdentityUserId());
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Scheduling ────────────────────────────────────────

    [HttpGet("schedules")]
    public async Task<ActionResult<ApiResponse<List<YOThemeScheduleEntry>>>> ListSchedules([FromQuery] string theme = null)
    {
        try
        {
            var result = await _studioService.ListSchedulesAsync(theme);
            if (!result.Success)
                return ErrorResponse<List<YOThemeScheduleEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeScheduleEntry>>(501, e.Message);
        }
    }

    [HttpPost("schedules")]
    public async Task<ActionResult<ApiResponse<object>>> SaveSchedule([FromBody] YOThemeScheduleSaveRequest request)
    {
        try
        {
            var result = await _studioService.SaveScheduleAsync(request);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpDelete("schedules/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteSchedule(long id)
    {
        try
        {
            var result = await _studioService.DeleteScheduleAsync(id);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("schedules/conflicts")]
    public async Task<ActionResult<ApiResponse<List<YOThemeScheduleConflict>>>> CheckScheduleConflicts([FromBody] YOThemeScheduleSaveRequest request)
    {
        try
        {
            var result = await _studioService.CheckScheduleConflictsAsync(request);
            if (!result.Success)
                return ErrorResponse<List<YOThemeScheduleConflict>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeScheduleConflict>>(501, e.Message);
        }
    }

    // ── Plugins ───────────────────────────────────────────

    [HttpGet("plugins")]
    public async Task<ActionResult<ApiResponse<List<YOThemePluginEntry>>>> ListPlugins()
    {
        try
        {
            var result = await _studioService.ListPluginsAsync();
            if (!result.Success)
                return ErrorResponse<List<YOThemePluginEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemePluginEntry>>(501, e.Message);
        }
    }

    [HttpPost("plugins/{id:long}/toggle")]
    public async Task<ActionResult<ApiResponse<object>>> TogglePlugin(long id, [FromQuery] bool enabled)
    {
        try
        {
            var result = await _studioService.SetPluginEnabledAsync(id, enabled);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Experiments / fixtures / integrations ─────────────

    [HttpGet("experiments")]
    public async Task<ActionResult<ApiResponse<List<YOThemeExperimentEntry>>>> ListExperiments()
    {
        var result = await _studioService.ListExperimentsAsync();
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<List<YOThemeExperimentEntry>>(501, result.Message);
    }

    [HttpPost("experiments")]
    public async Task<ActionResult<ApiResponse<object>>> SaveExperiment([FromBody] YOThemeExperimentSaveRequest request)
    {
        var result = await _studioService.SaveExperimentAsync(request);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
    }

    [HttpPost("experiments/{id:long}/status")]
    public async Task<ActionResult<ApiResponse<object>>> SetExperimentStatus(long id, [FromQuery] string status)
    {
        var result = await _studioService.SetExperimentStatusAsync(id, status);
        return result.Success ? SuccessResponse<object>(result.Message, null) : ErrorResponse<object>(501, result.Message);
    }

    [HttpGet("fixtures")]
    public async Task<ActionResult<ApiResponse<List<YOThemeFixtureEntry>>>> ListFixtures([FromQuery] string application = null)
    {
        var result = await _studioService.ListFixturesAsync(application);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<List<YOThemeFixtureEntry>>(501, result.Message);
    }

    [HttpPost("fixtures")]
    public async Task<ActionResult<ApiResponse<object>>> SaveFixture([FromBody] YOThemeFixtureSaveRequest request)
    {
        var result = await _studioService.SaveFixtureAsync(request);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
    }

    [HttpDelete("fixtures/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteFixture(long id)
    {
        var result = await _studioService.DeleteFixtureAsync(id);
        return result.Success ? SuccessResponse<object>(result.Message, null) : ErrorResponse<object>(501, result.Message);
    }

    [HttpGet("integrations")]
    public async Task<ActionResult<ApiResponse<List<YOThemeIntegrationEntry>>>> ListIntegrations([FromQuery] string theme)
    {
        var result = await _studioService.ListIntegrationsAsync(theme);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<List<YOThemeIntegrationEntry>>(501, result.Message);
    }

    [HttpPost("integrations")]
    public async Task<ActionResult<ApiResponse<object>>> SaveIntegration([FromBody] YOThemeIntegrationSaveRequest request)
    {
        var result = await _studioService.SaveIntegrationAsync(request);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
    }

    [HttpDelete("integrations/{id:long}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteIntegration(long id)
    {
        var result = await _studioService.DeleteIntegrationAsync(id);
        return result.Success ? SuccessResponse<object>(result.Message, null) : ErrorResponse<object>(501, result.Message);
    }

    [HttpPost("bulk-tokens")]
    public async Task<ActionResult<ApiResponse<object>>> BulkEditTokens([FromBody] YOThemeBulkTokenEditRequest request)
    {
        var result = await _studioService.BulkEditTokensAsync(request, ClientIp);
        return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
    }

    [AllowAnonymous]
    [HttpPost("analytics/events")]
    public async Task<ActionResult<ApiResponse<object>>> TrackAnalytics([FromBody] YOThemeAnalyticsEventRequest request)
    {
        var result = await _studioService.TrackAnalyticsAsync(request);
        return result.Success ? SuccessResponse<object>(result.Message, null) : ErrorResponse<object>(501, result.Message);
    }

    [HttpGet("analytics")]
    public async Task<ActionResult<ApiResponse<YOThemeAnalyticsSummary>>> GetAnalytics([FromQuery] string theme = null)
    {
        return SuccessResponse("Success", await _studioService.GetAnalyticsAsync(theme));
    }

    [HttpGet("readiness/{guid}")]
    public async Task<ActionResult<ApiResponse<YOThemePublishReadiness>>> GetReadiness(string guid)
    {
        return SuccessResponse("Success", await _studioService.GetPublishReadinessAsync(guid));
    }

    // ── Audit / health ────────────────────────────────────

    [HttpGet("audit/{guid}")]
    public async Task<ActionResult<ApiResponse<List<YOThemeAuditEntry>>>> ListAudit(string guid, [FromQuery] int limit = 100)
    {
        try
        {
            var result = await _studioService.ListAuditAsync(guid, limit);
            if (!result.Success)
                return ErrorResponse<List<YOThemeAuditEntry>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeAuditEntry>>(501, e.Message);
        }
    }

    [HttpGet("health/{guid}")]
    public async Task<ActionResult<ApiResponse<YOThemeHealthResult>>> GetHealth(string guid)
    {
        try
        {
            var result = await _studioService.GetHealthAsync(guid);
            return SuccessResponse("Success", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOThemeHealthResult>(501, e.Message);
        }
    }

    // ── CVD Simulation (blueprint §41) ──────

    [HttpPost("cvd-analysis")]
    public async Task<ActionResult<ApiResponse<object>>> RunCVDAnalysis([FromBody] YOThemeCVDRequest request)
    {
        try
        {
            var result = await _studioService.RunCVDAnalysisAsync(request.YOThemeUniqueId, request.SimulationType);
            if (!result.Success) return ErrorResponse<object>(501, result.Message);
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Token Dependency Graph (blueprint §39) ──

    [HttpGet("dependency-graph/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> GetDependencyGraph(string guid)
    {
        try
        {
            var result = await _studioService.GetTokenDependencyGraphAsync(guid);
            if (!result.Success) return ErrorResponse<object>(501, result.Message);
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Concurrent Editing (blueprint §82) ────

    [HttpPost("lock-field")]
    public async Task<ActionResult<ApiResponse<object>>> LockField([FromBody] YOThemeLockRequest request)
    {
        try
        {
            var result = await _studioService.LockFieldAsync(request.YOThemeUniqueId, request.FieldPath, request.UserId);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("unlock-field")]
    public async Task<ActionResult<ApiResponse<object>>> UnlockField([FromBody] YOThemeLockRequest request)
    {
        try
        {
            var result = await _studioService.UnlockFieldAsync(request.YOThemeUniqueId, request.FieldPath, request.UserId);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("active-locks/{guid}")]
    public async Task<ActionResult<ApiResponse<List<YOThemeEditLock>>>> ListActiveLocks(string guid)
    {
        try
        {
            var result = await _studioService.ListActiveLocksAsync(guid);
            if (!result.Success) return ErrorResponse<List<YOThemeEditLock>>(501, result.Message);
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeEditLock>>(501, e.Message);
        }
    }

    // ── Roles & Permissions (blueprint §79) ──

    [HttpGet("roles/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> ListRoles(string guid)
    {
        try
        {
            var result = await _studioService.ListRolesAsync(guid);
            if (!result.Success) return ErrorResponse<object>(501, result.Message);
            return SuccessResponse(result.Message, (object?)result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("assign-role/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> AssignRole(string guid, [FromBody] YOThemeRoleRequest request)
    {
        try
        {
            var result = await _studioService.AssignRoleAsync(guid, request.UserId, request.Role);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Performance Budget (blueprint §85) ──

    [HttpPost("performance-budget/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> RecordPerformanceBudget(string guid, [FromBody] YOThemePerformanceRequest request)
    {
        try
        {
            var result = await _studioService.RecordPerformanceBudgetAsync(guid, request.Metric, request.Value, request.Unit);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("performance-budget/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> GetPerformanceBudget(string guid)
    {
        try
        {
            var result = await _studioService.GetPerformanceBudgetAsync(guid);
            if (!result.Success) return ErrorResponse<object>(501, result.Message);
            return SuccessResponse(result.Message, (object?)result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Documentation Generator (blueprint §76) ──

    [HttpPost("documentation/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> GenerateDocumentation(string guid, [FromBody] YOThemeDocRequest request)
    {
        try
        {
            var result = await _studioService.GenerateDocumentationAsync(guid, request.Format);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Complete Export Pipeline (blueprint §72) ──

    [HttpGet("export/{guid}/platform/{platform}")]
    public async Task<ActionResult<ApiResponse<object>>> ExportPlatform(string guid, string platform)
    {
        try
        {
            var result = await _studioService.ExportPlatformAsync(guid, platform);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Bulk Editing (blueprint §97) ────────

    [HttpPost("bulk-replace/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> BulkReplaceTokens(string guid, [FromBody] YOThemeBulkReplaceRequest request)
    {
        try
        {
            var result = await _studioService.BulkReplaceTokensAsync(guid, request.Replacements, request.DryRun);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Figma Live Sync Webhooks (blueprint §74) ──

    [HttpPost("figma-webhook")]
    public async Task<ActionResult<ApiResponse<object>>> ProcessFigmaWebhook([FromBody] YOThemeFigmaWebhookRequest request)
    {
        try
        {
            var result = await _studioService.ProcessFigmaWebhookAsync(request.IntegrationId, request.FigmaFileKey, request.Payload);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("figma-push/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> PushToFigma(string guid)
    {
        try
        {
            var result = await _studioService.PushToFigmaAsync(guid);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── AI Copilot / Phase 6 ──
    [HttpPost("analyze-url/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> AnalyzeUrl(string guid, [FromBody] YOThemeUrlAnalysisRequest request)
    {
        try
        {
            request.YOThemeGUID = guid;
            var result = await _studioService.AnalyzeUrlAsync(guid, request.Url);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("extract-image-style/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> ExtractImageStyle(string guid, [FromBody] YOThemeImageStyleRequest request)
    {
        try
        {
            request.YOThemeGUID = guid;
            var result = await _studioService.ExtractImageStyleAsync(guid, request.AssetId);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("apply-content-context/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> ApplyContentContext(string guid, [FromBody] YOThemeContentContextRequest request)
    {
        try
        {
            request.YOThemeGUID = guid;
            var result = await _studioService.ApplyContentContextRulesAsync(guid, request.ContextJson);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("set-rtl/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> SetRtl(string guid, [FromBody] YOThemeRtlRequest request)
    {
        try
        {
            request.YOThemeGUID = guid;
            var result = await _studioService.SetRtlSupportAsync(guid, request.Enabled);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("set-high-contrast/{guid}")]
    public async Task<ActionResult<ApiResponse<object>>> SetHighContrast(string guid, [FromBody] YOThemeHighContrastRequest request)
    {
        try
        {
            request.YOThemeGUID = guid;
            var result = await _studioService.SetHighContrastSupportAsync(guid, request.Enabled);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("validate-marketplace-package")]
    public async Task<ActionResult<ApiResponse<object>>> ValidateMarketplacePackage([FromBody] YOThemeMarketplaceValidationRequest request)
    {
        try
        {
            var result = await _studioService.ValidateMarketplacePackageAsync(request.PackageJson);
            return result.Success ? SuccessResponse(result.Message, result.Data) : ErrorResponse<object>(501, result.Message);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }
}
