// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.DataAnnotations;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace YangOne.Localization
{
  

    public static class LocaleResourceExtension
    {
        public static IServiceCollection EnableYOLocalization(this IServiceCollection services,Action<LocaleSetting> config  )
        {
            var setting=new LocaleSetting();
            config(setting);
            services.TryAddSingleton<LocaleSetting>(setting);
            services.TryAddSingleton<ILocaleService, LocaleService>();
            services.TryAddSingleton<ResourceBuilder>();
            services.TryAddSingleton<ILocaleResourceProvider,LocaleResourceProvider>();
            
            services.Configure<MvcDataAnnotationsLocalizationOptions>(options =>
            {
               // options.DataAnnotationLocalizerProvider = (type, factory) => new DataAnnotationLocalizer();
                options.DataAnnotationLocalizerProvider = (type, factory) => factory.Create(typeof(DataAnnotationLocalizer));
            });

            return services;
        }
        public static IApplicationBuilder UseYOLocalization(this IApplicationBuilder app)
        {
           var builder= app.ApplicationServices.GetService<ResourceBuilder>();
            Task.Run(async () => { await builder.Build(); });
            return app;
        }
    }
}
