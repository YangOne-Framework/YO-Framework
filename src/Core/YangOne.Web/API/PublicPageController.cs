using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using YangOne.Log;
using YangOne.Web.API;

namespace YangOne.Web;

[Route("api/public/pages")]
public class PublicPageController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IPageService _pageService;
    private readonly IMasterLayoutService _masterLayoutService;
    private readonly IMemoryCache _cache;

    public PublicPageController(ILogger logger, IPageService pageService, IMasterLayoutService masterLayoutService, IMemoryCache cache)
    {
        _logger = logger;
        _pageService = pageService;
        _masterLayoutService = masterLayoutService;
        _cache = cache;
    }

    [AllowAnonymous]
    [HttpGet("{*slug}")]
    public async Task<ActionResult<ApiResponse<PublicPageResponse>>> GetBySlug(string slug)
    {
        try
        {
            slug = slug?.TrimStart('/') ?? "";
            if (string.IsNullOrEmpty(slug))
                slug = "home";

            if (PublicPageCache.TryGet(_cache, slug, out var cached))
                return SuccessResponse("Success (cached)", cached);

            var result = await _pageService.CmsGetBySlug(slug, "published");
            if (!result.Success || result.Data == null)
                return ErrorResponse<PublicPageResponse>(404, "Page not found");

            var response = await PublicPageCache.BuildAndCache(_cache, result.Data, _masterLayoutService);
            return SuccessResponse("Success", response);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<PublicPageResponse>(501, e.Message);
        }
    }
}

public class CmsContentConfig
{
    [Newtonsoft.Json.JsonProperty("masterLayoutConfig")]
    public object MasterLayoutConfig { get; set; }

    [Newtonsoft.Json.JsonProperty("seo")]
    public object Seo { get; set; }

    [Newtonsoft.Json.JsonProperty("pageSettings")]
    public object PageSettings { get; set; }

    [Newtonsoft.Json.JsonProperty("sections")]
    public object Sections { get; set; }

    [Newtonsoft.Json.JsonProperty("components")]
    public object Components { get; set; }
}

public class PublicPageResponse
{
    public string PageId { get; set; }
    public string Title { get; set; }
    public string Slug { get; set; }
    public string Status { get; set; }
    public string MasterLayoutId { get; set; }
    public object MasterLayoutConfig { get; set; }
    public MasterLayout MasterLayout { get; set; }
    public SeoDto Seo { get; set; }
    public PageSettingsDto Settings { get; set; }
    public List<SectionDto> Sections { get; set; }
    public Dictionary<string, object> Components { get; set; }
    public int Version { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class SeoDto
{
    public string MetaTitle { get; set; }
    public string MetaDescription { get; set; }
    public string Keywords { get; set; }
    public string OgImage { get; set; }
}

public class PageSettingsDto
{
    public string ContainerMode { get; set; }
    public string BackgroundColor { get; set; }
    public string CustomCss { get; set; }
}

public class SectionDto
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string LayoutPresetId { get; set; }
    public object Settings { get; set; }
    public List<ColumnDto> Columns { get; set; }
}

public class ColumnDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public object Span { get; set; }
    public List<string> Components { get; set; }
}
