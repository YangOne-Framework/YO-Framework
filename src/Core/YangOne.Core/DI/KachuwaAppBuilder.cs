// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyModel;

namespace YangOne.DI
{
    /// <summary>
    /// Discovers and configures all IAppBuilderRegistrar implementations in the application pipeline.
    /// </summary>
    public class YOAppBuilder
    {
        private readonly IApplicationBuilder _app;
        private readonly IServiceProvider _serviceProvider;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public YOAppBuilder(IApplicationBuilder app,
            IServiceProvider serviceProvider, IWebHostEnvironment hostingEnvironment)
        {
            _app = app;
            _serviceProvider = serviceProvider;
            _hostingEnvironment = hostingEnvironment;
            Configure();
        }

        public Task<IApplicationBuilder> Configure()
        {
            var appBuilderInstances = new List<IAppBuilderRegistrar>();

            var platform = Environment.OSVersion.Platform.ToString();         
            var runtimeAssemblyNames = DependencyContext.Default.GetRuntimeAssemblyNames(platform);
            var filteredAssemblies = runtimeAssemblyNames.Where(x => !(x.Name.Contains("Microsoft") || x.Name.Contains("System"))).ToList();
            var instances = filteredAssemblies
                .Select(Assembly.Load)
                .SelectMany(a => a.ExportedTypes)
                .Where(t => TypeExtensions.GetInterfaces(t).Contains(typeof(IAppBuilderRegistrar)) && t.GetConstructor(Type.EmptyTypes) != null)
                .Select(y => (IAppBuilderRegistrar)Activator.CreateInstance(y));
            appBuilderInstances.AddRange(instances);

            foreach (var instance in appBuilderInstances)
            {
                //TODO:: check module installed or not
                instance.Configure(_app, _serviceProvider, _hostingEnvironment);
            }

            return Task.FromResult(_app);
        }
    }
}
