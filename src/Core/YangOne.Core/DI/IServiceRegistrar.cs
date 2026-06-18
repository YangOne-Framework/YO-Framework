// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.DI
{
    /// <summary>
    /// Defines a contract for registering services into the DI container.
    /// </summary>
    public interface IServiceRegistrar
    {
       // void Register(IServiceCollection serviceCollection);
        void Update(IServiceCollection serviceCollection);
        void Register(IServiceCollection serviceCollection, IConfiguration configuration);
    }
}
