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
    public interface IOptimizationConfigService
    {
        Task<OptimizationConfig> GetConfigAsync();
        Task SaveConfigAsync(OptimizationConfig config);
    }

    public class OptimizationConfigService : IOptimizationConfigService
    {
        private readonly string _configPath;
        private readonly JsonSerializerOptions _jsonOptions;

        public OptimizationConfigService(IWebHostEnvironment env)
        {
            var appData = Path.Combine(env.ContentRootPath, "App_Data");
            if (!Directory.Exists(appData))
                Directory.CreateDirectory(appData);

            _configPath = Path.Combine(appData, "optimizationconfig.json");

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
    }
}
