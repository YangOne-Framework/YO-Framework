using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Html;
using System.Text.Json;

namespace YangOne.Web.Optimizer
{
    public interface IYOBundler
    {
        Task<HtmlString> BundleCss(string[] files);
        Task<HtmlString> BundleCss(string name, string[] files);
        Task<HtmlString> BundleJs(string[] files);
        Task<HtmlString> BundleJs(string name, string[] files);
    }
    public class OptimizationConfig
    {
        public bool EnableJsMinification { get; set; }
        public bool EnableCSSMinification { get; set; }
        public bool CachingDirectory { get; set; }
        public bool UseImageResizer { get; set; }
    }
    public class CacheInfo
    {
        public long SizeInBytes { get; set; }
        public int FileCount { get; set; }
        public string SizeFormatted { get; set; }
    }

    public class BundleInfo
    {
        public string Name { get; set; }
        public int FileCount { get; set; }
        public string Type { get; set; }
    }

    public interface IOptimizationConfigService
    {
        Task<OptimizationConfig> GetConfigAsync();
        Task SaveConfigAsync(OptimizationConfig config);
        Task<CacheInfo> GetCacheInfoAsync();
        Task ClearCacheAsync();
        Task<string> IncrementVersionAsync();
    }

    public class OptimizationConfigService : IOptimizationConfigService
    {
        private readonly string _configPath;
        private readonly string _smidgePath;
        private readonly string _smidgeConfigPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public OptimizationConfigService(IWebHostEnvironment env)
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            if (!Directory.Exists(appData))
                Directory.CreateDirectory(appData);

            _configPath = Path.Combine(appData, "optimizationconfig.json");
            _smidgePath = Path.Combine(env.ContentRootPath, "smidge");
            _smidgeConfigPath = Path.Combine(env.ContentRootPath, "smidge.json");

            _jsonOptions = new JsonSerializerOptions
            {
                WriteIndented = true
            };
        }

        public async Task<OptimizationConfig> GetConfigAsync()
        {
            if (!File.Exists(_configPath))
            {
                return new OptimizationConfig
                {
                    EnableJsMinification = false,
                    EnableCSSMinification = false,
                    CachingDirectory = false,
                    UseImageResizer = true
                };
            }

            var json = await File.ReadAllTextAsync(_configPath);
            return JsonSerializer.Deserialize<OptimizationConfig>(json, _jsonOptions)
                   ?? new OptimizationConfig();
        }

        public async Task SaveConfigAsync(OptimizationConfig config)
        {
            var json = JsonSerializer.Serialize(config, _jsonOptions);
            await File.WriteAllTextAsync(_configPath, json);
        }

        public async Task<CacheInfo> GetCacheInfoAsync()
        {
            if (!Directory.Exists(_smidgePath))
            {
                return new CacheInfo { SizeInBytes = 0, FileCount = 0, SizeFormatted = "0 B" };
            }

            var files = Directory.GetFiles(_smidgePath, "*", SearchOption.AllDirectories);
            long totalSize = 0;
            foreach (var file in files)
            {
                try
                {
                    totalSize += new FileInfo(file).Length;
                }
                catch { }
            }

            return new CacheInfo
            {
                SizeInBytes = totalSize,
                FileCount = files.Length,
                SizeFormatted = FormatSize(totalSize)
            };
        }

        public Task ClearCacheAsync()
        {
            if (Directory.Exists(_smidgePath))
            {
                foreach (var file in Directory.GetFiles(_smidgePath, "*", SearchOption.AllDirectories))
                {
                    try { File.Delete(file); } catch { }
                }
                foreach (var dir in Directory.GetDirectories(_smidgePath))
                {
                    try { Directory.Delete(dir, true); } catch { }
                }
            }

            return Task.CompletedTask;
        }

        public async Task<string> IncrementVersionAsync()
        {
            var version = "1";
            if (File.Exists(_smidgeConfigPath))
            {
                var json = await File.ReadAllTextAsync(_smidgeConfigPath);
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement.Clone();
                if (root.TryGetProperty("smidge", out var smidge) &&
                    smidge.TryGetProperty("version", out var v))
                {
                    var current = v.GetString() ?? "1";
                    version = int.TryParse(current, out var num) ? (num + 1).ToString() : "1";
                }
            }

            var newConfig = $"{{\n  \"smidge\": {{\n    \"dataFolder\": \"smidge\",\n    \"version\": \"{version}\"\n  }}\n}}";
            await File.WriteAllTextAsync(_smidgeConfigPath, newConfig);

            return version;
        }

        private static string FormatSize(long bytes)
        {
            string[] sizes = { "B", "KB", "MB", "GB" };
            int order = 0;
            double size = bytes;
            while (size >= 1024 && order < sizes.Length - 1)
            {
                order++;
                size /= 1024;
            }
            return $"{size:0.##} {sizes[order]}";
        }
    }
}
