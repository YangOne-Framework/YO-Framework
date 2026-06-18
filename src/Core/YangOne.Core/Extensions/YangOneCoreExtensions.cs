// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.DI;
using YangOne.Web.Razor;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using YangOne.Caching;
using YangOne.Configuration;
using YangOne.Diagnostics;
using YangOne.Log;
using YangOne.Log.Serilog;
using YangOne.Messaging;
using YangOne.Plugin;
using YangOne.Security;
using YangOne.Storage;
using YangOne.Web;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using ILogger = YangOne.Log.ILogger;

namespace YangOne.Extensions
{
    /// <summary>
    /// Registers core YO framework services and configures the application pipeline.
    /// </summary>
    public static class YangOneCoreExtensions
    {
        public static IServiceCollection RegisterYOCoreServices(this IServiceCollection services,
            IServiceProvider serviceProvider)
        {
            var configuration = serviceProvider.GetService<IConfiguration>();
            var changeEvent = serviceProvider.GetService<ConfigChangeEvent>();
            var applicationLifetime = serviceProvider.GetService<IHostApplicationLifetime>();
            var autoReset = new AutoResetEvent(false);
            changeEvent.Attach(new YangOneConfigChangeListner(applicationLifetime));
            ChangeToken.OnChange(() =>
                    configuration.GetReloadToken(),
                () =>
                {
                    autoReset.Set();
                    changeEvent.Notify();
                }
            );
            //config to json service
            services.TryAddSingleton<IConfigToJson, ConfigToJson>();
            // Add functionality to inject IOptions<T>
            services.AddOptions();// Add our Config object so it can be injected
            services.Configure<YangOneAppConfig>(configuration.GetSection("YangOneAppConfig"));
            services.AddScoped(cfg => cfg.GetService<IOptionsSnapshot<YangOneAppConfig>>().Value);
            services.AddScoped(cfg => cfg.GetService<IOptionsSnapshot<YangOneConnectionStrings>>().Value);
            //to access YO app config           

            //TODO:: conflict on services

            // services.AddHttpContextAccessor();

            //registering service for later use
            services.AddSingleton(services);
            services.TryAddSingleton<ILoggerSetting, DefaultLoggerSetting>();
            services.TryAddSingleton<ILogProvider, DefaultLogProvider>();
            services.TryAddSingleton<ILogger, SerilogFileLogger>();
            services.TryAddSingleton<ActivitySourceProvider>();
            services.TryAddSingleton<IYangOnePubSub>(new YangOnePubSub());
            //removed 
            //services.TryAddSingleton<ILoggerService, FileBaseLogger>();
            services.AddTransient<LogErrorAttribute>();
            var logger = serviceProvider.GetService<ILogger>();
            IWebHostEnvironment hostingEnvironment = serviceProvider.GetService<IWebHostEnvironment>();
            var plugs = new PluginBootStrapper(hostingEnvironment, logger, services);
            //TODO::moved to web
            //services.TryAddSingleton<IPluginService, PluginService>();
            services.AddScoped<IViewRenderService, ViewRenderService>();
      
            services.AddTransient<YOCacheAttribute>();
            services.AddSingleton<IFileOptions, DefaultFileOptions>();
            services.RegisterYOStorageService();
            //TODO:: allow in start up

             new Bootstrapper(services, serviceProvider);
            services.AddLocalization();
            var policy = new Microsoft.AspNetCore.Cors.Infrastructure.CorsPolicy();

            policy.Headers.Add("*");
            policy.Methods.Add("*");
            policy.Origins.Add("*");
            policy.PreflightMaxAge = TimeSpan.MaxValue;
            // policy.SupportsCredentials = true;

            services.AddCors(x => x.AddPolicy("corsGlobalPolicy", policy));
            services.TryAddSingleton<ICspNonceService, CspNonceService>();

            services.AddHttpContextAccessor();
            services.RegisterYangOneWebCore();
            services.Configure<RazorViewEngineOptions>(options =>
            {
                options.ViewLocationExpanders.Insert(0, new ViewOverrideLocationExpander());

            });
          
            return services;
            // Add application services.
            //services.AddTransient<IEmailSender, EmailSender>();
            //services.AddTransient<ISmsSender, SmsSender>();

        }


        public static IApplicationBuilder UseYOCore(this IApplicationBuilder app, IWebHostEnvironment hostingEnvironment, IServiceProvider serviceProvider)
        {

            new YOAppBuilder(app, serviceProvider, hostingEnvironment);
            app.UseCors("corsGlobalPolicy");
            app.UseSession();
            app.UseResponseCompression();
            var cspConfig = CspConfigLoader.Load( Path.Combine(hostingEnvironment.ContentRootPath,"app_data","cspconfig.json"));

            app.UseSecurityHeadersMiddleware(builder =>
            {
                builder.AddContentSecurity(cspBuilder =>
                {
                    cspBuilder.ApplyConfig(cspConfig);
                });
            });

            return app;

        }
      

    }
}

