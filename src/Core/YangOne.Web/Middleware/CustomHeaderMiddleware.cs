using System;
using System.Threading.Tasks;
using YangOne.Web.Service;
using Microsoft.AspNetCore.Http;
using YangOne.Configuration;

namespace YangOne.Web.Middleware
{
    public class HeaderConstants
    {
        public const string TimeZoneStandardName = "TZSN";
        public const string TimeZoneOffset = "TZO";
    }
    public class CustomHeaderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ISettingService _settingService;
        private readonly YangOneAppConfig  _appConfig;


        public CustomHeaderMiddleware(RequestDelegate next)//, ISettingService settingService, Microsoft.Extensions.Options.IOptionsSnapshot<Configuration.KachuwaAppConfig> appConfig)
        {
            _next = next;
            //_settingService = settingService;
            //_kachuwaAppConfig = appConfig.Value;
        }

        public async Task Invoke(HttpContext context)
        {

            //bool isInstalled = false;
            //isInstalled = _kachuwaAppConfig.IsInstalled;
            //if (isInstalled)
            //{
            //    var setting = await _settingService.GetSetting();
            //    //IHeaderDictionary headers = context.Response.Headers;
            //    context.Items[HeaderConstants.TimeZoneStandardName] = setting.TimeZoneName;
            //    context.Items[HeaderConstants.TimeZoneOffset] = setting.TimeZoneOffset;
            //}
            await _next(context);

        }
    }
}