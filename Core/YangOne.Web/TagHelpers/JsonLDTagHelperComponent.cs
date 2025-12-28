using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using YangOne.Caching;
using YangOne.Configuration;
using YangOne.Log;

namespace YangOne.Web.TagHelpers
{
    public class JsonLdTagHelperComponent : TagHelperComponent
    {
        private readonly ISeoService _seoService;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger _logger;
        private readonly ICacheService _cacheService;
        private readonly YangOneAppConfig _appConfig;

        //order to inject first or last
        public override int Order => 5;
        public JsonLdTagHelperComponent(ISeoService seoService,
            IHttpContextAccessor httpContextAccessor,
            IOptionsSnapshot<YangOneAppConfig> configSnapShot
            , ILogger logger, ICacheService cacheService)
        {
            _seoService = seoService;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
            _cacheService = cacheService;
            _appConfig = configSnapShot.Value;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (_appConfig.IsInstalled)
            {
                var area = _httpContextAccessor.HttpContext.GetRouteData().Values["area"];

                if (area == null)
                {

                    if (string.Equals(context.TagName, "head", StringComparison.Ordinal))
                    {
                        try
                        {
                            string json = await _cacheService.GetAsync<string>("JsonLdTagHelper", async () => await _seoService.GenerateJsonLdForPage(), TimeSpan.FromHours(1));
                            output.PostContent.AppendHtmlLine($"{json}");
                        }
                        catch (Exception e)
                        {
                            _logger.Log(LogType.Error, () => e.Message, e);
                        }

                    }
                }
            }

        }
    }

}