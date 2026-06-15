using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using YangOne.AntiVirus;
using YangOne.Caching;
using YangOne.Web.AntiVirus.AVG;
using YangOne.Web.AntiVirus.Defender;
using YangOne.Web.AntiVirus.Eset;
using YangOne.Web.Caching;
using YangOne.Web.Caching.Redis;

namespace YangOne.Web.Extenstions;

public static class YangOneSetUpServiceExtensions
{
    public static IServiceCollection UseDefaultMemoryCache(this IServiceCollection services)
    {
        services.TryAddSingleton<ICacheService, DefaultCacheService>();
        return services;
    }
    public static IServiceCollection UseRedisCache(this IServiceCollection services)
    {
        services.Configure<RedisConfiguration>(config =>
        {
            config.EndPoints = new List<string> { "localhost:6379" };
            config.UseSsl = false;
            config.TimeOut = 5000;
            config.SyncTimeOut = 5000;
        });
        services.TryAddSingleton<ICacheService, RedisCacheService>();
        return services;
    }

    public static IServiceCollection UseWindowsDefenderScanner(this IServiceCollection services)
    {
        services.TryAddSingleton<IVirusScanner, WindowsDefenderScanner>();
        return services;
    }
    public static IServiceCollection UseAvgAntiVirusScanner(this IServiceCollection services)
    {
        services.TryAddSingleton<IVirusScanner, AVGScanner>();
        return services;
    }
    public static IServiceCollection UseEsetVirusScanner(this IServiceCollection services)
    {
        services.TryAddSingleton<IVirusScanner, EsetScanner>();
        return services;
    }

}