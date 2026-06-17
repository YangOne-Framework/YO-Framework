// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Threading.Tasks;
using YangOne.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace YangOne.Localization
{


    public class SystemCultureProvider : RequestCultureProvider
    {
        public IConfigurationRoot Configuration { get; set; }

        public override Task<ProviderCultureResult> DetermineProviderCultureResult(HttpContext httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException();
            }

            var yoConfigSnap=httpContext.RequestServices.GetService<IOptionsSnapshot<YangOneAppConfig>>();          
            var providerResultCulture = new ProviderCultureResult("");//yoConfigSnap.BaseCulture);

            return Task.FromResult(providerResultCulture);
        }
        //use
        // options.RequestCultureProviders.Insert(0, new SystemCultureProvider());
        // app.UseRequestLocalization(options);
    }
}
