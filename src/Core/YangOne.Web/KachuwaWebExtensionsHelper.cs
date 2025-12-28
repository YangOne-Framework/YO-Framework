//using Kachuwa.Caching;
//using Kachuwa.Installer;
//using Kachuwa.Log;
//using YangOne.Web.Layout;
//using YangOne.Web.Middleware;
//using YangOne.Web.Module;
//using YangOne.Web.Notification;
//using YangOne.Web.Optimizer;
//using YangOne.Web.Rule;
//using YangOne.Web.Security;
//using YangOne.Web.Service;
//using YangOne.Web.Service.Installer;
//using YangOne.Web.Services;
//using YangOne.Web.TagHelpers;
//using YangOne.Web.Templating;
//using Microsoft.AspNetCore.Builder;
//using Microsoft.AspNetCore.Hosting;
//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc.Infrastructure;
//using Microsoft.AspNetCore.Mvc.Razor;
//using Microsoft.AspNetCore.Razor.TagHelpers;
//using Microsoft.Extensions.Configuration;
//using Microsoft.Extensions.DependencyInjection;
//using Microsoft.Extensions.DependencyInjection.Extensions;
//using Smidge;
//using Smidge.CompositeFiles;
//using Smidge.FileProcessors;
//using Smidge.Nuglify;
//using Smidge.Options;

//namespace YangOne.Web
//{
//    public static class KachuwaWebExtensionsHelper
//    {
//        public static IServiceCollection RegisterKachuwaWebServices(this IServiceCollection services,
//            bool isInstalled, IConfiguration configuration)
//        {
//            services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
//            services.AddSingleton<ISettingService, SettingService>();
//            services.TryAddSingleton<ILayoutRenderer, LayoutContentRenderer>();
//            services.TryAddSingleton<ISeoService, SeoService>();
//            services.TryAddSingleton<IPageService, PageService>();
//            services.AddSingleton<ICountryService, CountryService>();
//            services.AddSingleton<IAuditService, AuditService>();
//            services.AddScoped<IKachuwaConfigurationManager, KachuwaConfigurationManager>();
//            var serviceProvider = services.BuildServiceProvider();
//            var logger = serviceProvider.GetService<ILogger>();
//            var pageService = serviceProvider.GetService<IPageService>();
//            var cacheService = serviceProvider.GetService<ICacheService>();
//            var ctxaccessor = serviceProvider.GetService<IHttpContextAccessor>();

//            services.Configure<RazorViewEngineOptions>(opts =>
//            {
//                opts.FileProviders.Add(
//                    new PageFileProvider(pageService, logger, cacheService, ctxaccessor));
//            });
//            services.AddSingleton<IRuleService, RuleService>();
//            services.AddSingleton<IScriptRunner, SQLScriptRunner>();
//            services.AddSingleton<IModuleService, ModuleService>();
//            services.AddSingleton<IModuleManager, ModuleManager>();
//            services.AddScoped<IModuleComponentProvider, ModuleComponentProvider>();
           
//            services.AddSingleton<IMenuService, MenuService>();
//            services.AddSingleton<ITemplateEngine, MustacheTemplateEngine>();
//            services.AddSingleton<ITokenGenerator, TokenGenerator>();
//            services.AddSingleton<ITagHelperComponent, SEOMetaTagHelperComponent>();
//            services.AddSingleton<ITagHelperComponent, JsonLdTagHelperComponent>();
//            services.RegisterNotificationService();

//            //use IEmailServiceProviderService for sender
//            // services.AddSingleton<IEmailSender, SmtpEmailSender>();
//            //services.AddSingleton<ISmsSender, SmsSender>();

//            services.AddSingleton<IEmailServiceProviderService, EmailServiceProviderService>();
//            services.AddSingleton<ISMSService, SMSService>();
//            services.AddSingleton<ITemplateDataSourceManager, TemplateDataSourceManager>();
//            //****for testing******//
//            //services.TryAddSingleton<IRazorViewEngine, RazorViewEngine2>();
//            //services.TryAddSingleton<IView,Razor2View>();

//            //var ctxaccessor = services.BuildServiceProvider().GetService<IHttpContextAccessor>();
//            //var ctx = new ContextResolver(ctxaccessor);
//            //services.AddSingleton(ctx);
//            services.AddSingleton<IPaymentService, PaymentService>();
//            if (isInstalled)
//            {
//                var modules = new ModuleRegistrar(services, logger);
//            }

//           var hostingProvider= serviceProvider.GetService<IWebHostEnvironment>();
//            services.AddSmidge(configuration.GetSection("smidge"), new SmidgeFileProvider(hostingProvider));
//            services.AddSmidgeNuglify();
//            services.Configure<SmidgeOptions>(opt =>
//            {
//                opt.UrlOptions=new UrlManagerOptions
//                {
//                    BundleFilePath = "optimizer",
//                    MaxUrlLength = 2048,
//                    CompositeFilePath = "optimizerx"
//                };
                
//                opt.PipelineFactory.OnCreateDefault = (type, pipeline) => pipeline.Replace<JsMinifier, NuglifyJs>(opt.PipelineFactory);
//            });
//            services.AddScoped<IKachuwaBundler, SmidgeBundler>();
//            return services;
//        }
//        public static IApplicationBuilder UseKachuwaWeb(this IApplicationBuilder app,bool useDefaultRoute)
//        {
          
//            app.UseMiddleware<ModuleResourceMiddleware>();
//            if (useDefaultRoute)
//            {
//                app.UseRoutes();
//            }
            
//            return app;
//        }
//        public static IApplicationBuilder UseRoutes(this IApplicationBuilder app)
//        {
//            app.UseMvc(routes =>
//            {
//                routes.MapRoute(
//                  name: "default",
//                  template: "{pageUrl?}",
//                  defaults: new { controller = "KachuwPage", action = "Index" }
//                 // , constraints: new { pageUrl = @"\w+" }
//                 );

//                routes.MapRoute(
//                    name: "default1",
//                    template: "{controller=Home}/{action=Index}/{id?}");

//                routes.MapRoute(name: "areaRoute",
//                    template: "{area:exists}/{controller}/{action}/{id?}",
//                    defaults: new { area = "Admin", controller = "Dashboard", action = "Index" });



//            });
//            app.UseSmidge();
//            app.UseSmidgeNuglify();
//            return app;
//        }

//    }
//}