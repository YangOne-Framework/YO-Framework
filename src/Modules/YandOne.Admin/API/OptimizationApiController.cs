// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Optimizer;

namespace YandOne.Admin.API;

[Route("api/v1/optimization")]
/// <summary>
/// Represents a class OptimizationApiController.
/// </summary>
public class OptimizationApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IOptimizationConfigService _optimizationConfigService;

    public OptimizationApiController(
        ILogger logger,
        IOptimizationConfigService optimizationConfigService)
    {
        _logger = logger;
        _optimizationConfigService = optimizationConfigService;
    }

    [HttpGet("config")]
    public async Task<ActionResult<ApiResponse<OptimizationConfig>>> GetConfig()
    {
        try
        {
            var config = await _optimizationConfigService.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<OptimizationConfig>(501, e.Message);
        }
    }

    [HttpPost("config/save")]
    public async Task<ActionResult<ApiResponse<bool>>> SaveConfig([FromBody] OptimizationConfig model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            await _optimizationConfigService.SaveConfigAsync(model);
            return SuccessResponse("Optimization configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpGet("cache/info")]
    public async Task<ActionResult<ApiResponse<CacheInfo>>> GetCacheInfo()
    {
        try
        {
            var info = await _optimizationConfigService.GetCacheInfoAsync();
            return SuccessResponse("Success", info);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<CacheInfo>(501, e.Message);
        }
    }

    [HttpPost("cache/clear")]
    public async Task<ActionResult<ApiResponse<bool>>> ClearCache()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<bool>();

            await _optimizationConfigService.ClearCacheAsync();
            return SuccessResponse("Cache cleared successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    [HttpPost("version/increment")]
    public async Task<ActionResult<ApiResponse<string>>> IncrementVersion()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<string>();

            var version = await _optimizationConfigService.IncrementVersionAsync();
            return SuccessResponse("Version incremented", version);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }

    [HttpPost("rebuild")]
    public async Task<ActionResult<ApiResponse<string>>> Rebuild()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse<string>();

            await _optimizationConfigService.ClearCacheAsync();
            var version = await _optimizationConfigService.IncrementVersionAsync();
            return SuccessResponse("Bundles rebuilt successfully", version);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(501, e.Message);
        }
    }
}

