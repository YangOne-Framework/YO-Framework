using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using YangOne.Caching;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/cache")]
public class CacheApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly ICacheService _cacheService;
    private readonly IWebHostEnvironment _env;
    private readonly IHostApplicationLifetime _appLifetime;
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true };

    public CacheApiController(ILogger logger, ICacheService cacheService, IWebHostEnvironment env,
        IHostApplicationLifetime appLifetime)
    {
        _logger = logger;
        _cacheService = cacheService;
        _env = env;
        _appLifetime = appLifetime;
    }

    [HttpGet("info")]
    public IActionResult GetInfo()
    {
        try
        {
            var providerName = _cacheService.GetType().Name;
            var providerFullName = _cacheService.GetType().FullName ?? providerName;

            List<string> keys;
            try
            {
                keys = _cacheService.GetKeys() ?? new List<string>();
            }
            catch (NotImplementedException)
            {
                keys = new List<string>();
            }

            return SuccessResponse("Success", new
            {
                KeyCount = keys.Count,
                Keys = keys,
                ProviderName = providerName,
                ProviderType = providerFullName
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("list")]
    public IActionResult GetList()
    {
        try
        {
            List<string> keys;
            try
            {
                keys = _cacheService.GetKeys() ?? new List<string>();
            }
            catch (NotImplementedException)
            {
                keys = new List<string>();
            }

            var items = keys.Select(k => new { Key = k }).ToList();
            return SuccessResponse("Success", items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("flush")]
    public IActionResult Flush()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            _cacheService.Flush();
            return SuccessResponse("All cache cleared successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("refresh/{key}")]
    public IActionResult Refresh(string key)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            _cacheService.Remove(key);
            return SuccessResponse($"Cache key '{key}' removed successfully. It will be re-cached on next request.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("providers")]
    public IActionResult GetProviders()
    {
        try
        {
            var currentName = _cacheService.GetType().Name;
            var configPath = Path.Combine(_env.ContentRootPath, "App_Data", "cacheconfig.json");
            var configuredProvider = "Memory";

            if (System.IO.File.Exists(configPath))
            {
                var json = System.IO.File.ReadAllText(configPath);
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("CacheProvider", out var prop))
                    configuredProvider = prop.GetString() ?? "Memory";
            }

            var providers = new List<object>
            {
                new { Name = "In-Memory", Value = "Memory", IsCurrent = currentName.Contains("DefaultCache") || configuredProvider == "Memory" },
                new { Name = "Redis", Value = "Redis", IsCurrent = currentName.Contains("RedisCache") || configuredProvider == "Redis" }
            };

            return SuccessResponse("Success", new
            {
                Providers = providers,
                CurrentProvider = currentName.Contains("RedisCache") ? "Redis" : "Memory",
                ConfiguredProvider = configuredProvider,
                RequiresRestart = currentName.Contains("RedisCache")
                    ? (configuredProvider != "Redis")
                    : (configuredProvider != "Memory")
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("provider/switch")]
    public IActionResult SwitchProvider([FromBody] SwitchProviderModel model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (model.Provider != "Memory" && model.Provider != "Redis")
                return ValidationResponse(new List<string> { "Invalid provider. Must be 'Memory' or 'Redis'." });

            var configPath = Path.Combine(_env.ContentRootPath, "App_Data", "cacheconfig.json");
            var config = new { CacheProvider = model.Provider };
            var json = JsonSerializer.Serialize(config, _jsonOptions);
            System.IO.File.WriteAllText(configPath, json);

            return SuccessResponse(
                $"Cache provider changed to '{model.Provider}'. Application restart required to apply the change.",
                new { Provider = model.Provider, RestartRequired = true });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("restart")]
    public IActionResult Restart()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            _appLifetime.StopApplication();
            return SuccessResponse("Application is restarting...", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    public class SwitchProviderModel
    {
        public string Provider { get; set; }
    }
}
