// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Service;
using YangOne.Web.Model;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using YangOne.Configuration;
using YangOne.Localization;
using YangOne.Log;

namespace YangOne.Web.TagHelpers
{
    /// <summary>
    /// Injects system variable settings (timezone, locale, etc.) into the page head.
    /// </summary>
    public class SystemVariablesTagHelperComponent : TagHelperComponent
    {
        private readonly ILogger _logger;
        private readonly ILocaleService _localeService;
        private readonly ISettingService _settingService;
        private readonly ITimeZoneService _timeZoneService;
        private readonly YangOneAppConfig _appConfig;

        public override int Order => 2;
        public SystemVariablesTagHelperComponent(IOptionsSnapshot<YangOneAppConfig> configSnapShot
            , ILogger logger, ILocaleService localeService, ISettingService settingService,
            ITimeZoneService timeZoneService)
        {
            _logger = logger;
            _localeService = localeService;
            _settingService = settingService;
            _timeZoneService = timeZoneService;
            _appConfig = configSnapShot.Value;
        }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            if (_appConfig.IsInstalled)
            {
                if (string.Equals(context.TagName, "head", StringComparison.Ordinal))
                {
                    var setting = await _settingService.GetSetting();
                    var todaysDate = DateTime.Now;
                    var localization = await _localeService.GetDefaultLocaleRegion();

                    string timeZoneName = "";
                    int timeZoneOffset = 0;
                    if (setting.TimeZoneId > 0)
                    {
                        var tz = await _timeZoneService.TimeZoneCrudService.GetAsync(setting.TimeZoneId);
                        if (tz != null)
                        {
                            timeZoneName = tz.StandardName;
                            timeZoneOffset = tz.BaseUtcOffsetSec;
                        }
                    }

                    var json = JsonConvert.SerializeObject(new
                    {
                        Today = todaysDate.ToString("yyyy-MM-dd"),
                        TimeZoneName = timeZoneName,
                        TimeZoneOffset = timeZoneOffset,
                        TimeZoneId = setting.TimeZoneId,
                        setting.BaseCulture,
                        setting.BaseCurrency,
                        LocaleRegion = new { localization?.Culture, localization?.Flag, localization?.CountryId }
                    });
                    string variables = @"<script type='text/javascript'>
                        __YOSettings=" + json + "</script><script type='text/javascript' src='/assets/js/locale/kachuwalocale.js'></script> ";

                    output.PostContent.AppendHtmlLine(variables);
                }
            }
        }
    }
}
