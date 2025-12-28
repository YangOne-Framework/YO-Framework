using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using YangOne.DI;

namespace YangOne.Web
{
    public class WebServiceRegistrar : IServiceRegistrar
    {
        private bool _isInstalled = false;

        public void Register(IServiceCollection services, IConfiguration configuration)
        {
            var str_isInstalled = configuration["YangOneAppConfig:IsInstalled"].ToLower();
            _isInstalled = str_isInstalled != "false";

            services.RegisterKachuwaWebServices(_isInstalled, configuration);
            var embeddedAssembly = new EmbeddedFileProvider(typeof(WebServiceRegistrar).GetTypeInfo().Assembly);
            services.Configure<MvcRazorRuntimeCompilationOptions>(opts => { opts.FileProviders.Add(embeddedAssembly); });
            


        }

        public void Update(IServiceCollection serviceCollection)
        {
            if (_isInstalled)
            {

                
            }

        }
    }
}