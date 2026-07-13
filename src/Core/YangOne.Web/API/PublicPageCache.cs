using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;

namespace YangOne.Web;

public static class PublicPageCache
{
    private static readonly ConcurrentDictionary<string, CancellationTokenSource> _invalidators = new();
    private const string PAGE_TAG = "tag_public_page";
    private const string LAYOUT_TAG = "tag_public_layout";
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

        var options = new MemoryCacheEntryOptions()
            .SetAbsoluteExpiration(TimeSpan.FromHours(CACHE_HOURS))
            .AddExpirationToken(new CancellationChangeToken(pageCts.Token))
            .AddExpirationToken(new CancellationChangeToken(layoutCts.Token));

        cache.Set(PageKey(slug), response, options);
    }

    /// <summary>
    /// Call when a page is saved/published – clears public page cache.
    /// </summary>
    public static void InvalidatePage()
    {
        if (_invalidators.TryRemove(PAGE_TAG, out var cts))
        {
            cts.Cancel();
        }
    }

    /// <summary>
    /// Call when a layout is saved – clears ALL public page caches.
    /// </summary>
    public static void InvalidateLayout()
    {
        if (_invalidators.TryRemove(LAYOUT_TAG, out var cts))
        {
            cts.Cancel();
        }
    }

    /// <summary>
    /// Builds a PublicPageResponse from a Page entry and caches it immediately.
    /// Used after publish so the public API returns cached data on next request.
    /// </summary>
    public static async Task<PublicPageResponse> BuildAndCache(IMemoryCache cache, Page entry, IMasterLayoutService layoutService)
    {
        var slug = entry.Slug ?? entry.Url?.TrimStart('/');
        var contentConfig = DeserializeJson<CmsContentConfig>(entry.ContentConfig);

        MasterLayout masterLayout = null;
        if (!string.IsNullOrEmpty(entry.MasterLayoutId) && entry.MasterLayoutId != "none")
        {
            var layoutResult = await layoutService.GetByGuidAsync(entry.MasterLayoutId);
            if (layoutResult.Success)
                masterLayout = layoutResult.Data;
        }

        var response = new PublicPageResponse
        {
            PageId = entry.PageGUID,
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
            UpdatedAt = entry.LastModified
        };

        if (!string.IsNullOrEmpty(slug))
            Set(cache, slug, response);

        return response;
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
