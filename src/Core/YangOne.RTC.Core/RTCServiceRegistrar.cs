// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using YangOne.DI;

namespace YangOne.RTC
{
    public class RTCServiceRegistrar : IServiceRegistrar
    {
        public void Update(IServiceCollection serviceCollection)
        {

        }

        public void Register(IServiceCollection serviceCollection, IConfiguration configuration)
        {
            serviceCollection.AddSingleton<IRTCConnectionManager, MemoryConnectionManager>();
            serviceCollection.AddSingleton<IRTCUserService, RTCPersistentConnectionManager>();

        }
    }


}
