// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Threading.Tasks;
using YangOne.Web.Service;
using Microsoft.AspNetCore.Http;
using YangOne.Configuration;

namespace YangOne.Web.Middleware
{
    /// <summary>
    /// Constants for custom HTTP header names.
    /// </summary>
    public class HeaderConstants
    {
        public const string TimeZoneStandardName = "TZSN";
        public const string TimeZoneOffset = "TZO";
    }
    /// <summary>
    /// Adds custom headers to HTTP responses.
    /// </summary>
    public class CustomHeaderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ISettingService _settingService;
        private readonly YangOneAppConfig _appConfig;


        public CustomHeaderMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {

            //bool isInstalled = false;
            //isInstalled = _appConfig.IsInstalled;
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
