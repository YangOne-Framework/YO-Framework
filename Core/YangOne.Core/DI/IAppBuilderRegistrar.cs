using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;

namespace YangOne.DI
{
    public interface IAppBuilderRegistrar
    {
        void Configure(IApplicationBuilder app, IServiceProvider serviceProvider, IWebHostEnvironment env);
    }
}