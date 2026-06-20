// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using YangOne.Caching;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Admin.Dto;
using YangOne.Web.API;

namespace YandOne.Admin.API;

[Route("api/v1/cache")]
/// <summary>
/// Represents a class CacheApiController.
/// </summary>
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
    public ActionResult<ApiResponse<CacheInfoDto>> GetInfo()
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

            var dto = new CacheInfoDto(keys.Count, keys, providerName, providerFullName);
            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<CacheInfoDto>(501, e.Message);
        }
    }

    [HttpGet("list")]
    public ActionResult<ApiResponse<List<CacheKeyDto>>> GetList()
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

            var items = keys.Select(k => new CacheKeyDto(k)).ToList();
            return SuccessResponse("Success", items);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<List<CacheKeyDto>>(501, e.Message);
        }
    }

    [HttpPost("flush")]
    public ActionResult<ApiResponse<bool>> Flush()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            _cacheService.Flush();
            return SuccessResponse("All cache cleared successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("refresh/{key}")]
    public ActionResult<ApiResponse<bool>> Refresh(string key)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            _cacheService.Remove(key);
            return SuccessResponse($"Cache key '{key}' removed successfully. It will be re-cached on next request.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("providers")]
    public ActionResult<ApiResponse<CacheProvidersDto>> GetProviders()
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

            var isRedis = currentName.Contains("RedisCache");
            var providers = new List<CacheProviderDto>
            {
                new("In-Memory", "Memory", isRedis ? false : configuredProvider == "Memory"),
                new("Redis", "Redis", isRedis || configuredProvider == "Redis")
            };

            var dto = new CacheProvidersDto(
                providers,
                isRedis ? "Redis" : "Memory",
                configuredProvider,
                isRedis ? (configuredProvider != "Redis") : (configuredProvider != "Memory")
            );

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<CacheProvidersDto>(501, e.Message);
        }
    }

    [HttpPost("provider/switch")]
    public ActionResult<ApiResponse<bool>> SwitchProvider([FromBody] SwitchProviderModel model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            if (model.Provider != "Memory" && model.Provider != "Redis")
                return ValidationResponse<bool>(new List<string> { "Invalid provider. Must be 'Memory' or 'Redis'." });

            var configPath = Path.Combine(_env.ContentRootPath, "App_Data", "cacheconfig.json");
            var config = new { CacheProvider = model.Provider };
            var json = JsonSerializer.Serialize(config, _jsonOptions);
            System.IO.File.WriteAllText(configPath, json);

            return SuccessResponse(
                $"Cache provider changed to '{model.Provider}'. Application restart required to apply the change.",
                true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("restart")]
    public ActionResult<ApiResponse<bool>> Restart()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            _appLifetime.StopApplication();
            return SuccessResponse("Application is restarting...", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    /// <summary>
    /// Represents a class SwitchProviderModel.
    /// </summary>
    public class SwitchProviderModel
    {
        public string Provider { get; set; }
    }
}

