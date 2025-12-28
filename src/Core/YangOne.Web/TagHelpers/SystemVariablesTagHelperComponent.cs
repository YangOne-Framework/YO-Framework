using YangOne.Web.Service;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using YangOne.Configuration;
using YangOne.Localization;
using YangOne.Log;

namespace YangOne.Web.TagHelpers
{
    public class SystemVariablesTagHelperComponent : TagHelperComponent
    {
        private readonly ILogger _logger;
        private readonly ILocaleService _localeService;
        private readonly ISettingService _settingService;
        private readonly YangOneAppConfig _appConfig;

        //order to inject first or last
        public override int Order => 2;
        public SystemVariablesTagHelperComponent(IOptionsSnapshot<YangOneAppConfig> configSnapShot
            , ILogger logger, ILocaleService localeService,ISettingService settingService)
        {
          
            _logger = logger;
            _localeService = localeService;
            _settingService = settingService;
            _appConfig = configSnapShot.Value;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (_appConfig.IsInstalled)
            {
                if (string.Equals(context.TagName, "head", StringComparison.Ordinal))
                {
                    var setting = await _settingService.GetSetting();
                    //TODO::need to fix in linux /mac
                    var utcDateNow = DateTime.UtcNow;
                    var todaysDate = DateTime.Now;// TimeZoneInfo.ConvertTimeFromUtc(utcDateNow, TimeZoneInfo.FindSystemTimeZoneById(setting.TimeZoneName));
                    var localization = await _localeService.GetDefaultLocaleRegion();
                    var json = JsonConvert.SerializeObject( new
                        { Today= todaysDate.ToString("yyyy-MM-dd"),
                            setting.TimeZoneName,
                            setting.TimeZoneOffset,
                            setting.BaseCulture,
                            setting.BaseCurrency,
                            LocaleRegion = new { localization?.Culture,localization?.Flag,localization?.CountryId }

                        }
                    );
                    string variables = @"<script type='text/javascript'>
                        __kachuwaSettings=" + json + "</script><script type='text/javascript' src='/assets/js/locale/kachuwalocale.js'></script> ";

                    output.PostContent.AppendHtmlLine(variables);

                }

            }

        }
    }
}