// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;
using Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.FileProviders;
using WholisticMinds.Core.DI;

namespace Azure.BlobStorage.Helper
{
    /// <summary>
    /// Registers Azure Blob Storage services into the dependency injection container
    /// </summary>
    public class ServiceRegistrar : IServiceRegistrar
    {
        public void Update(IServiceCollection serviceCollection)
        {

        }

        public void Register(IServiceCollection serviceCollection, IConfiguration configuration)
        {
          
           
            serviceCollection.TryAddTransient<WholisticMindsBlobStorageProvider>();

            var assp = new EmbeddedFileProvider(typeof(ServiceRegistrar).GetTypeInfo().Assembly);
            serviceCollection.Configure<MvcRazorRuntimeCompilationOptions>(opts =>
                opts.FileProviders.Add(assp)
            );
        }
    }
}
