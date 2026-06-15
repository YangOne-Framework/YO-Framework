using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using YandOne.Admin.Service;
using YangOne.Admin.Service;
using YangOne.DI;
using YangOne.Web.Service;
using YangOne.Web.Services;

namespace YandOne.Admin;

public class AdminModuleRegistrar : IServiceRegistrar
{
    public void Update(IServiceCollection serviceCollection)
    {

    }

    public void Register(IServiceCollection services, IConfiguration configuration)
    {

        services.AddScoped<IMenuService, MenuService>();
        services.AddScoped<IMediaLibraryService, MediaLibraryService>();
        services.AddScoped<IHtmlComponentService, HtmlComponentService>();
        services.AddSingleton<ICountryService, CountryService>();
        services.AddScoped<ITimeZoneService, TimeZoneService>();
        services.AddSingleton<IRestrictionService, RestrictionService>();


        var assp = new EmbeddedFileProvider(typeof(AdminModuleRegistrar).GetTypeInfo().Assembly);

        services.Configure<MvcRazorRuntimeCompilationOptions>(opts =>
            opts.FileProviders.Add(assp)
        );


    }
}