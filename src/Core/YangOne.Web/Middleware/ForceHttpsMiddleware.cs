// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Service;
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Middleware
{
    /// <summary>
    /// Redirects HTTP requests to HTTPS when configured.
    /// </summary>
    public class ForceHttpsMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ISettingService _settingService;

        public ForceHttpsMiddleware(RequestDelegate next, ISettingService settingService)
        {
            _next = next;
            _settingService = settingService;
        }

        public async Task Invoke(HttpContext context)
        {
            var setting = await _settingService.GetSetting();
            HttpRequest req = context.Request;
            if (req.IsHttps == false)
            {
                if (setting.UseHttps)
                {
                    string url = "https://" + req.Host + req.Path + req.QueryString;
                    context.Response.Redirect(url, permanent: true);
                }

            }
            else
            {
                await _next(context);
            }
        }
    }
}
