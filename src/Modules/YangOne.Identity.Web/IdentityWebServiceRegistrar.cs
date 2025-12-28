using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using YangOne.DI;

namespace YangOne.Identity.Web;

public class IdentityWebServiceRegistrar : IServiceRegistrar
{
    public void Register(IServiceCollection serviceCollection, IConfiguration configuration)
    {

           
        var currentAssembly = new EmbeddedFileProvider(typeof(IdentityWebServiceRegistrar).GetTypeInfo().Assembly);
        serviceCollection.Configure<MvcRazorRuntimeCompilationOptions>(opts =>
            opts.FileProviders.Add(currentAssembly)
        );
    }

    public void Update(IServiceCollection serviceCollection)
    {

    }
}