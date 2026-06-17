// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Storage
{
    public static class StorageServicesExtensions
    {
       
        public static IServiceCollection RegisterYOStorageService(this IServiceCollection services)
        {
           
            services.AddSingleton<IKeyGenerator, KeyGenerator>();
            //customize can upto azure blob storage amazon or any other
            services.AddSingleton<IStorageProvider, LocalStorageProvider>();
            return services;

        }
    }
}
