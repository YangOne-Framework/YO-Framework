using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/yotheme")]
public class YOThemeApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IYOThemeService _themeService;
    private readonly IMemoryCache _cache;

    public YOThemeApiController(ILogger logger, IYOThemeService themeService, IMemoryCache cache)
    {
        _logger = logger;
        _themeService = themeService;
        _cache = cache;
    }

    // ── CRUD ──────────────────────────────────────────────

    [HttpGet("list")]
    public async Task<ActionResult<ApiResponse<List<YOThemeListItem>>>> List(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string search = "",
        [FromQuery] string status = "all")
    {
        try
        {
            var result = await _themeService.ListAsync(offset, limit, search, status);
            if (!result.Success)
                return ErrorResponse<List<YOThemeListItem>>(501, result.Message);

            HttpContext.Items["RowTotal"] = result.RowTotal;
            return SuccessResponse(result.Message, result.DataList);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeListItem>>(501, e.Message);
        }
    }

    [HttpGet("get/{guid}")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> Get(string guid)
    {
        try
        {
            var result = await _themeService.GetAsync(guid);
            if (!result.Success)
                return ErrorResponse<YOTheme>(404, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpGet("active")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> GetActive()
    {
        try
        {
            var result = await _themeService.GetActiveAsync();
            if (!result.Success || result.Data == null)
                return SuccessResponse<YOTheme>("No active theme", null);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> Save([FromBody] YOThemeSaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return ErrorResponse<YOTheme>(600, "Invalid request");

            var result = await _themeService.SaveAsync(request);
            if (!result.Success)
                return ErrorResponse<YOTheme>(501, result.Message);

            // Invalidate page caches — theme config affects all rendered pages
            PublicPageCache.InvalidatePage();

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    [HttpPost("delete")]
    public async Task<ActionResult<ApiResponse<object>>> Delete([FromBody] YOThemeDeleteRequest request)
    {
        try
        {
            var result = await _themeService.DeleteAsync(request.YOThemeUniqueId, request.CascadeLayouts);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            // Invalidate all page caches when theme is deleted
            PublicPageCache.InvalidatePage();

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Activation ─────────────────────────────────────────

    [HttpPost("activate")]
    public async Task<ActionResult<ApiResponse<object>>> Activate([FromBody] YOThemeActivateRequest request)
    {
        try
        {
            var result = await _themeService.ActivateAsync(request.YOThemeUniqueId);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            // Invalidate ALL page caches — theme change affects everything
            PublicPageCache.InvalidatePage();

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Overrides ──────────────────────────────────────────

    [HttpGet("overrides/{themeId:long}")]
    public async Task<ActionResult<ApiResponse<List<YOThemeOverride>>>> GetOverrides(long themeId)
    {
        try
        {
            var result = await _themeService.GetOverridesAsync(themeId);
            if (!result.Success)
                return ErrorResponse<List<YOThemeOverride>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeOverride>>(501, e.Message);
        }
    }

    [HttpPost("overrides/save")]
    public async Task<ActionResult<ApiResponse<object>>> SaveOverrides([FromBody] YOThemeOverrideSaveRequest request)
    {
        try
        {
            var result = await _themeService.SaveOverridesAsync(request.YOThemeUniqueId, request.Overrides);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            // Invalidate all page caches — theme config changed
            PublicPageCache.InvalidatePage();

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("overrides/clear/{themeId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> ClearOverrides(long themeId)
    {
        try
        {
            var result = await _themeService.ClearOverridesAsync(themeId);
            if (!result.Success)
                return ErrorResponse<object>(501, result.Message);

            PublicPageCache.InvalidatePage();

            return SuccessResponse<object>(result.Message, null);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    // ── Export / Import ────────────────────────────────────

    [HttpGet("export/{guid}")]
    public async Task<ActionResult<ApiResponse<YOThemeExport>>> ExportTheme(string guid)
    {
        try
        {
            var result = await _themeService.ExportThemeJsonAsync(guid);
            if (!result.Success || result.Data == null)
                return ErrorResponse<YOThemeExport>(404, result.Message);

            var export = new YOThemeExport
            {
                Name = result.Data.Name,
                Slug = result.Data.Slug,
                Version = result.Data.Version,
                Author = result.Data.Author,
                Description = result.Data.Description,
                Tags = result.Data.Tags,
                Config = result.Data.Config
            };

            return SuccessResponse(result.Message, export);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOThemeExport>(501, e.Message);
        }
    }

    [HttpPost("import")]
    public async Task<ActionResult<ApiResponse<YOTheme>>> ImportTheme([FromBody] YOThemeImportRequest request)
    {
        try
        {
            var json = System.Text.Json.JsonSerializer.Serialize(request);
            var result = await _themeService.ImportThemeAsync(json);
            if (!result.Success)
                return ErrorResponse<YOTheme>(501, result.Message);

            PublicPageCache.InvalidatePage();

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<YOTheme>(501, e.Message);
        }
    }

    // ── Assignments ────────────────────────────────────────

    [HttpGet("assignments/{themeId:long}")]
    public async Task<ActionResult<ApiResponse<List<YOThemeAssignment>>>> GetAssignments(long themeId)
    {
        try
        {
            var result = await _themeService.GetThemeAssignmentsAsync(themeId);
            if (!result.Success)
                return ErrorResponse<List<YOThemeAssignment>>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<YOThemeAssignment>>(501, e.Message);
        }
    }
}
