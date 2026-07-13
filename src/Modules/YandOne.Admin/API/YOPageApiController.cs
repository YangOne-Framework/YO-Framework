using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using YangOne.Identity.Extensions;
using YangOne.Log;
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

    public YOPageApiController(ILogger logger, IPageService pageService, IMasterLayoutService masterLayoutService, IMemoryCache cache)
    {
        _logger = logger;
        _pageService = pageService;
        _masterLayoutService = masterLayoutService;
        _cache = cache;
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
            var result = await _pageService.CmsGetListAsync(offset, limit, status, search, culture);
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

    [HttpGet("{pageGuid}")]
    public async Task<ActionResult<ApiResponse<Page>>> GetPage(string pageGuid)
    {
        try
        {
            var result = await _pageService.CmsGetByPageGUID(pageGuid);
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

            var result = await _pageService.CmsSaveAsync(request);
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
            var result = await _pageService.CmsPublishAsync(request.PageId);
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

    [HttpDelete("{pageGuid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeletePage(string pageGuid)
    {
        try
        {
            var result = await _pageService.CmsDeleteAsync(pageGuid);
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
        [FromQuery] string excludePageGuid = "")
    {
        try
        {
            var exists = await _pageService.CmsCheckSlugExist(slug, excludePageGuid);
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

    
    [HttpGet("layout/{layoutGuid}")]
    public async Task<ActionResult<ApiResponse<MasterLayout>>> GetLayout(string layoutGuid)
    {
        try
        {
            var result = await _masterLayoutService.GetByGuidAsync(layoutGuid);
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

    [HttpDelete("layout/{layoutGuid}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLayout(string layoutGuid)
    {
        try
        {
            var result = await _masterLayoutService.DeleteAsync(layoutGuid);
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
