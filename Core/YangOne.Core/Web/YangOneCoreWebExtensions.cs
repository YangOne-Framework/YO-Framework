using YangOne.Web.Razor;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace YangOne.Web
{
    public static class YangOneCoreWebExtensions
    {
        public static IServiceCollection RegisterYangOneWebCore(this IServiceCollection services)
        {
            //services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            //services.AddSingleton<IActionContextAccessor, ActionContextAccessor>();
            //service to convert view to string

            services.TryAddSingleton<IViewRenderService, ViewRenderService>();
        
           
          
            // ContextResolver.Set(ctxaccessor);
           // services.AddSingleton(ContextResolver);

            return services;
        }
    }
}