// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
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
