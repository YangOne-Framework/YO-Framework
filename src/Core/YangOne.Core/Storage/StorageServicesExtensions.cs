using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Storage
{
    public static class StorageServicesExtensions
    {
       
        public static IServiceCollection RegisterKachuwaStorageService(this IServiceCollection services)
        {
           
            services.AddSingleton<IKeyGenerator, KeyGenerator>();
            //customize can upto azure blob storage amazon or any other
            services.AddSingleton<IStorageProvider, LocalStorageProvider>();
            return services;

        }
    }
}