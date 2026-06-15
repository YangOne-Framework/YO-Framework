using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Options;
using YangOne.Caching;
using YangOne.Configuration;
using YangOne.Log;

namespace YangOne.Web.TagHelpers
{
    public class SEOMetaTagHelperComponent : TagHelperComponent
    {
        private readonly ISeoService _seoService;
        private readonly IActionContextAccessor _actionContextAccessor;
        private readonly ILogger _logger;
        private readonly ICacheService _cacheService;
        private readonly YangOneAppConfig _appConfig;
        public override int Order => 1;
        public SEOMetaTagHelperComponent( ISeoService seoService, IActionContextAccessor actionContextAccessor,
            IOptionsSnapshot<YangOneAppConfig> configSnapShot
            , ILogger logger, ICacheService cacheService)
        {
            _seoService = seoService;
            _actionContextAccessor = actionContextAccessor;
            _logger = logger;
            _cacheService = cacheService;
            _appConfig = configSnapShot.Value;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (_appConfig.IsInstalled)
            { var area = _actionContextAccessor.ActionContext.RouteData.Values["area"];
                //ignoring any admin/user pages
                if (area == null)
                {
                   
                    try
                    {
                        if (string.Equals(context.TagName, "head", StringComparison.Ordinal))
                        {
                            string metatags = await  _seoService.GenerateMetaContents();
                            output.PreContent.AppendHtmlLine($"{metatags}");
                        }
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