using System.Collections.Concurrent;
using System.Data.Common;
using Dapper;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using YangOne.Data;

namespace YangOne.Web;

public static class PublicPageCache
{
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _invalidators = new();
    private const string PAGE_TAG = "tag_public_page";
    private const string LAYOUT_TAG = "tag_public_layout";
    private const string THEME_TAG = "tag_public_theme";
    private const int CACHE_HOURS = 4;

    /* Cross-node invalidation: mutations bump a version row in dbo.YOConfig and
       every node keys its page-cache entries on that row (polled with a short
       TTL). A publish/edit is therefore picked up by all instances within
       VERSION_TTL seconds instead of living for the full cache duration. */
    private const string VERSION_CONFIG_KEY = "PublicPageCacheVersion";
    private const string VERSION_CACHE_KEY = "public_cache_version";
    private static readonly TimeSpan VERSION_TTL = TimeSpan.FromSeconds(60);

    private static string PageKey(string slug, string version) =>
        $"public_page_{slug.ToLowerInvariant()}_{version ?? "v0"}";

    /// <summary>Current global cache version (DB-backed, short-TTL cached per node).
    /// Falls back to a stable value when the DB or the YOConfig row is unavailable.</summary>
    public static Task<string?> GetGlobalVersionAsync(IMemoryCache cache)
    {
        return cache.GetOrCreateAsync(VERSION_CACHE_KEY, e =>
        {
            e.AbsoluteExpirationRelativeToNow = VERSION_TTL;
            return ReadGlobalVersionAsync();
        });
    }

    private static async Task<string?> ReadGlobalVersionAsync()
    {
        try
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using var db = (DbConnection)dbFactory.GetConnection();
            await db.OpenAsync();
            return await db.ExecuteScalarAsync<string>(
                "SELECT ConfigValue FROM dbo.YOConfig WHERE ConfigKey = @Key",
                new { Key = VERSION_CONFIG_KEY });
        }
        catch
        {
            // YOConfig row/table not present yet — single-node invalidation still works.
            return null;
        }
    }

    /// <summary>Bump the global version so every node drops its page cache (best-effort).</summary>
    public static void BumpGlobalVersion()
    {
        _ = Task.Run(async () =>
        {
            try
            {
                var dbFactory = DbFactoryProvider.GetFactory();
                using var db = (DbConnection)dbFactory.GetConnection();
                await db.OpenAsync();
                await db.ExecuteAsync(
                    "IF NOT EXISTS (SELECT 1 FROM dbo.YOConfig WHERE ConfigKey = @Key) " +
                    "INSERT INTO dbo.YOConfig (ConfigKey, ConfigValue) VALUES (@Key, @Value) " +
                    "ELSE UPDATE dbo.YOConfig SET ConfigValue = @Value WHERE ConfigKey = @Key;",
                    new { Key = VERSION_CONFIG_KEY, Value = Guid.NewGuid().ToString("N") });
            }
            catch
            {
                // Best-effort only — local CTS invalidation already ran.
            }
        });
    }

    public static bool TryGet(IMemoryCache cache, string slug, string version, out PublicPageResponse response)
    {
        return cache.TryGetValue(PageKey(slug, version), out response);
    }

    public static void Set(IMemoryCache cache, string slug, string version, PublicPageResponse response)
    {
        var pageCts = _invalidators.GetOrAdd(PAGE_TAG, _ => new CancellationTokenSource());
        var layoutCts = _invalidators.GetOrAdd(LAYOUT_TAG, _ => new CancellationTokenSource());
        var themeCts = _invalidators.GetOrAdd(THEME_TAG, _ => new CancellationTokenSource());

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromHours(CACHE_HOURS))
            .AddExpirationToken(new CancellationChangeToken(pageCts.Token))
            .AddExpirationToken(new CancellationChangeToken(layoutCts.Token))
            .AddExpirationToken(new CancellationChangeToken(themeCts.Token));

        cache.Set(PageKey(slug, version), response, options);
    }

    public static void InvalidatePage()
    {
        if (_invalidators.TryRemove(PAGE_TAG, out var cts))
        {
            cts.Cancel();
        }
        BumpGlobalVersion();
    }

    public static void InvalidateLayout()
    {
        if (_invalidators.TryRemove(LAYOUT_TAG, out var cts))
        {
            cts.Cancel();
        }
        BumpGlobalVersion();
    }

    public static void InvalidateTheme()
    {
        if (_invalidators.TryRemove(THEME_TAG, out var cts))
        {
            cts.Cancel();
        }
        BumpGlobalVersion();
    }

    /// <summary>
    /// Resolve the current system active theme fresh for the given route
    /// (blueprint §10): route assignment -> platform default -> legacy active.
    /// Never cached — publishing is always reflected on the next request.
    /// Returns the theme id, its config JSON and the server-compiled CSS
    /// (Published snapshot preferred) so clients can skip client-side compilation.
    /// </summary>
    public static async Task<(long? YOThemeId, string YOThemeUniqueId, object ThemeConfig, string ThemeCompiledCss)> ResolveActiveTheme(string slug)
    {
        var dbFactory = DbFactoryProvider.GetFactory();
        // Resolve via studio assignment pipeline (blueprint §10).
        using var db = (DbConnection)dbFactory.GetConnection();
        await db.OpenAsync();
        YOTheme resolved = null;
        try
        {
            resolved = await db.QueryFirstOrDefaultAsync<YOTheme>(
                "usp_YOThemeStudio_Resolve",
                new { TargetType = "route", TargetKey = (string)null, Route = slug },
                commandType: System.Data.CommandType.StoredProcedure);
        }
        catch
        {
            // Studio migration not applied yet — fall back to the legacy active theme
        }
        if (resolved == null)
        {
            resolved = await db.QueryFirstOrDefaultAsync<YOTheme>(
                "usp_YOTheme_GetActive",
                commandType: System.Data.CommandType.StoredProcedure);
        }
        if (resolved == null)
            return (null, null, null, null);

        // Runtime always prefers the published snapshot (blueprint §8)
        return (
            resolved.YOThemeId,
            resolved.YOThemeUniqueId,
            TryParseConfig(resolved.PublishedConfig ?? resolved.Config),
            resolved.PublishedCss ?? resolved.CompiledCss);
    }

    public static async Task<PublicPageResponse> BuildAndCache(IMemoryCache cache, Page entry, IMasterLayoutService layoutService)
    {
        var slug = entry.Slug ?? entry.Url?.TrimStart('/');
        var contentConfig = DeserializeJson<CmsContentConfig>(entry.ContentConfig);
        var cacheVersion = await GetGlobalVersionAsync(cache);

        MasterLayout masterLayout = null;
        if (!string.IsNullOrEmpty(entry.MasterLayoutId) && entry.MasterLayoutId != "none")
        {
            var layoutResult = await layoutService.GetByIdAsync(entry.MasterLayoutId);
            if (layoutResult.Success)
                masterLayout = layoutResult.Data;
        }

        var (yoThemeId, yoThemeUniqueId, themeConfig, themeCompiledCss) = await ResolveActiveTheme(slug);

        var response = new PublicPageResponse
        {
            PageId = entry.PageUniqueId,
            Title = entry.Name,
            Slug = slug,
            Status = entry.Status ?? (entry.IsPublished ? "published" : "draft"),
            MasterLayoutId = entry.MasterLayoutId,
            MasterLayoutConfig = contentConfig?.MasterLayoutConfig,
            MasterLayout = masterLayout,
            Seo = contentConfig?.Seo != null
                ? JsonConvertDeserialize<SeoDto>(contentConfig.Seo)
                : new SeoDto { MetaTitle = entry.Name },
            Settings = contentConfig?.PageSettings != null
                ? JsonConvertDeserialize<PageSettingsDto>(contentConfig.PageSettings)
                : new PageSettingsDto { ContainerMode = "boxed", BackgroundColor = "#ffffff" },
            Sections = contentConfig?.Sections != null
                ? JsonConvertDeserialize<List<SectionDto>>(contentConfig.Sections)
                : new List<SectionDto>(),
            Components = contentConfig?.Components != null
                ? JsonConvertDeserialize<Dictionary<string, object>>(contentConfig.Components)
                : new Dictionary<string, object>(),
            Version = entry.Version,
            PublishedAt = entry.PublishedAt,
            UpdatedAt = entry.LastModified,
            TemplateType = entry.TemplateType ?? "page",
            YOThemeId = yoThemeId,
            YOThemeUniqueId = yoThemeUniqueId,
            ThemeConfig = themeConfig,
            ThemeCompiledCss = themeCompiledCss
        };

        if (!string.IsNullOrEmpty(slug))
            Set(cache, slug, cacheVersion, response);

        return response;
    }

    private static object TryParseConfig(string configJson)
    {
        if (string.IsNullOrEmpty(configJson)) return null;
        return configJson;
    }

    private static T DeserializeJson<T>(string json) where T : new()
    {
        if (string.IsNullOrEmpty(json)) return new T();
        try { return JsonConvert.DeserializeObject<T>(json); }
        catch { return new T(); }
    }

    private static T JsonConvertDeserialize<T>(object obj) where T : new()
    {
        if (obj == null) return new T();
        try
        {
            var json = JsonConvert.SerializeObject(obj);
            return JsonConvert.DeserializeObject<T>(json);
        }
        catch { return new T(); }
    }
}
