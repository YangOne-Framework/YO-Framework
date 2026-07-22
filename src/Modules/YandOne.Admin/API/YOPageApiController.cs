using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Storage;
using YangOne.Web;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/page")]
public class YOPageApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IPageService _pageService;
    private readonly IMasterLayoutService _masterLayoutService;
    private readonly IMemoryCache _cache;
    private readonly IStorageProvider _storageProvider;

    public YOPageApiController(ILogger logger, IPageService pageService, IMasterLayoutService masterLayoutService, IMemoryCache cache, IStorageProvider storageProvider)
    {
        _logger = logger;
        _pageService = pageService;
        _masterLayoutService = masterLayoutService;
        _cache = cache;
        _storageProvider = storageProvider;
    }

    // ── Page endpoints ──────────────────────────────────────────

    [HttpGet("list")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Page>>>> List(
        [FromQuery] int offset = 1,
        [FromQuery] int limit = 20,
        [FromQuery] string status = "all",
        [FromQuery] string search = "",
        [FromQuery] string culture = "")
    {
        try
        {
            var result = await _pageService.GetAllActive(offset, limit, status, search, culture);
            if (!result.Success)
                return ErrorResponse<IEnumerable<Page>>(501, result.Message);

            HttpContext.Items["RowTotal"] = result.RowTotal;
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Page>>(501, e.Message);
        }
    }

    [HttpGet("{pageUniqueId}")]
    public async Task<ActionResult<ApiResponse<Page>>> GetPage(string pageUniqueId)
    {
        try
        {
            var result = await _pageService.GetByPageUniqueId(pageUniqueId);
            if (!result.Success || result.Data == null)
                return ErrorResponse<Page>(404, "Page not found");

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Page>(501, e.Message);
        }
    }

    [HttpPost("save")]
    public async Task<ActionResult<ApiResponse<Page>>> SavePage([FromBody] CmsPageSaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return ErrorResponse<Page>(600, "Invalid request");

            var result = await _pageService.Save(request);
            if (!result.Success)
                return ErrorResponse<Page>(501, result.Message);

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Page>(501, e.Message);
        }
    }

    [HttpPost("publish")]
    public async Task<ActionResult<ApiResponse<Page>>> PublishPage([FromBody] CmsPagePublishRequest request)
    {
        try
        {
            var result = await _pageService.Publish(request.PageId);
            if (!result.Success)
                return ErrorResponse<Page>(404, result.Message);

            PublicPageCache.InvalidatePage();
            if (result.Data != null)
            {
                await PublicPageCache.BuildAndCache(_cache, result.Data, _masterLayoutService);
            }
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Page>(501, e.Message);
        }
    }

    [HttpDelete("{pageUniqueId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePage(string pageUniqueId)
    {
        try
        {
            var result = await _pageService.Delete(pageUniqueId);
            if (!result)
                return ErrorResponse<bool>(404, "Page not found");

            return SuccessResponse("Page deleted", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("check-slug")]
    public async Task<ActionResult<ApiResponse<bool>>> CheckSlug(
        [FromQuery] string slug,
        [FromQuery] string excludePageUniqueId = "")
    {
        try
        {
            var exists = await _pageService.CheckSlugExist(slug, excludePageUniqueId);
            return SuccessResponse("OK", exists);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    // ── Master Layout endpoints ─────────────────────────────────

   
    [HttpGet("layout/list")]
    public async Task<ActionResult<ApiResponse<List<MasterLayout>>>> ListLayouts()
    {
        try
        {
            var result = await _masterLayoutService.GetListAsync();
            if (!result.Success)
                return ErrorResponse<List<MasterLayout>>(501, result.Message);

            return SuccessResponse(result.Message, result.DataList);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<MasterLayout>>(501, e.Message);
        }
    }

    [HttpGet("layout/list-light")]
    public async Task<ActionResult<ApiResponse<List<MasterLayout>>>> ListLayoutsLight()
    {
        try
        {
            var result = await _masterLayoutService.GetListLightAsync();
            if (!result.Success)
                return ErrorResponse<List<MasterLayout>>(501, result.Message);

            return SuccessResponse(result.Message, result.DataList);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<MasterLayout>>(501, e.Message);
        }
    }

    
    [HttpPost("layout/image/add")]
    public async Task<ActionResult<ApiResponse<object>>> AddLayoutImage([FromForm] IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return ErrorResponse(600, "No image file provided.");

            // Store on the server via the configured storage provider and return a
            // relative URL. Storing a URL (instead of a base64 blob) keeps the
            // layout config small, which makes DB rows lighter and selection faster.
            var relativeUrl = await _storageProvider.Save("layout/images", file);
            if (string.IsNullOrEmpty(relativeUrl))
                return ErrorResponse(501, "Failed to store the image.");

            return SuccessResponse<object>("Image uploaded", new { url = relativeUrl });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("layout/{layoutUniqueId}")]
    public async Task<ActionResult<ApiResponse<MasterLayout>>> GetLayout(string layoutUniqueId)
    {
        try
        {
            var result = await _masterLayoutService.GetByIdAsync(layoutUniqueId);
            if (!result.Success || result.Data == null)
                return ErrorResponse<MasterLayout>(404, "Layout not found");

            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<MasterLayout>(501, e.Message);
        }
    }

    [HttpPost("layout/save")]
    public async Task<ActionResult<ApiResponse<MasterLayout>>> SaveLayout([FromBody] MasterLayoutSaveRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
                return ErrorResponse<MasterLayout>(600, "Invalid request");

            var result = await _masterLayoutService.SaveAsync(request);
            if (!result.Success)
                return ErrorResponse<MasterLayout>(501, result.Message);

            PublicPageCache.InvalidateLayout();
            return SuccessResponse(result.Message, result.Data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<MasterLayout>(501, e.Message);
        }
    }

    [HttpDelete("layout/{layoutUniqueId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLayout(string layoutUniqueId)
    {
        try
        {
            var result = await _masterLayoutService.DeleteAsync(layoutUniqueId);
            if (!result.Success)
                return ErrorResponse<bool>(404, result.Message);

            return SuccessResponse("Layout deleted", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }
}

public class CmsPagePublishRequest
{
    public string PageId { get; set; }
}
