// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using YangOne.DI;

namespace YangOne.Identity.Web;

/// <summary>
/// Represents a class IdentityWebServiceRegistrar.
/// </summary>
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
