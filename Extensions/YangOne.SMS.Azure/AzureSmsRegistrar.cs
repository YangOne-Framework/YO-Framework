using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using WholisticMinds.Core.DI;
using WholisticMinds.Web.Service;

namespace Azure.SMSSender
{
    public class AzureSmsRegistrar : IServiceRegistrar
    {
        private bool _isInstalled = false;

        public void Register(IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddTransient<ISmsSender, AzureSmsSender>();
          
            var assp = new EmbeddedFileProvider(typeof(AzureSmsRegistrar).GetTypeInfo().Assembly);
            serviceCollection.Configure<MvcRazorRuntimeCompilationOptions>(opts =>
            {
                opts.FileProviders.Add(assp);
            });


        }

        public void Update(IServiceCollection serviceCollection)
        {
            if (_isInstalled)
            {
                
            }

        }
    }
}