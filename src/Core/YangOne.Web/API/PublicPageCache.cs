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

    private static string PageKey(string slug) => $"public_page_{slug.ToLowerInvariant()}";

    public static bool TryGet(IMemoryCache cache, string slug, out PublicPageResponse response)
    {
        return cache.TryGetValue(PageKey(slug), out response);
    }

    public static void Set(IMemoryCache cache, string slug, PublicPageResponse response)
    {
        var pageCts = _invalidators.GetOrAdd(PAGE_TAG, _ => new CancellationTokenSource());
        var layoutCts = _invalidators.GetOrAdd(LAYOUT_TAG, _ => new CancellationTokenSource());
        var themeCts = _invalidators.GetOrAdd(THEME_TAG, _ => new CancellationTokenSource());

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromHours(CACHE_HOURS))
            .AddExpirationToken(new CancellationChangeToken(pageCts.Token))
            .AddExpirationToken(new CancellationChangeToken(layoutCts.Token))
            .AddExpirationToken(new CancellationChangeToken(themeCts.Token));

        cache.Set(PageKey(slug), response, options);
    }

    public static void InvalidatePage()
    {
        if (_invalidators.TryRemove(PAGE_TAG, out var cts))
        {
            cts.Cancel();
        }
    }

    public static void InvalidateLayout()
    {
        if (_invalidators.TryRemove(LAYOUT_TAG, out var cts))
        {
            cts.Cancel();
        }
    }

    public static void InvalidateTheme()
    {
        if (_invalidators.TryRemove(THEME_TAG, out var cts))
        {
            cts.Cancel();
        }
    }

    /// <summary>
    /// Resolve the current system active theme fresh for the given route
    /// (blueprint §10): route assignment -> platform default -> legacy active.
    /// Never cached — publishing is always reflected on the next request.
    /// </summary>
    public static async Task<(long? YOThemeId, object ThemeConfig)> ResolveActiveTheme(string slug)
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
            return (null, null);

        // Runtime always prefers the published snapshot (blueprint §8)
        return (resolved.YOThemeId, TryParseConfig(resolved.PublishedConfig ?? resolved.Config));
    }

    public static async Task<PublicPageResponse> BuildAndCache(IMemoryCache cache, Page entry, IMasterLayoutService layoutService)
    {
        var slug = entry.Slug ?? entry.Url?.TrimStart('/');
        var contentConfig = DeserializeJson<CmsContentConfig>(entry.ContentConfig);

        MasterLayout masterLayout = null;
        if (!string.IsNullOrEmpty(entry.MasterLayoutId) && entry.MasterLayoutId != "none")
        {
            var layoutResult = await layoutService.GetByIdAsync(entry.MasterLayoutId);
            if (layoutResult.Success)
                masterLayout = layoutResult.Data;
        }

        var (yoThemeId, themeConfig) = await ResolveActiveTheme(slug);

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
            ThemeConfig = themeConfig
        };

        if (!string.IsNullOrEmpty(slug))
            Set(cache, slug, response);

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
