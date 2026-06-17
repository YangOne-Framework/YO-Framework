// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Middleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using YangOne.DI;

namespace YangOne.Web
{
    public class WebApplicationBuilderRegistrar : IAppBuilderRegistrar
    {
        public void Configure(IApplicationBuilder app, IServiceProvider serviceProvider, IWebHostEnvironment env)
        {
            //app.UseMiddleware<CustomHeaderMiddleware>();
            app.UseMiddleware<ImageResizerMiddleware>();
            app.UseStaticHttpContext();
        }
    }
}
