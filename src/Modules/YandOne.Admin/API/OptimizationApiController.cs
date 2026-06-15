using Microsoft.AspNetCore.Mvc;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Optimizer;

namespace YandOne.Admin.API;

[Route("api/v1/optimization")]
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
    public async Task<IActionResult> GetConfig()
    {
        try
        {
            var config = await _optimizationConfigService.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("config/save")]
    public async Task<IActionResult> SaveConfig([FromBody] OptimizationConfig model)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            await _optimizationConfigService.SaveConfigAsync(model);
            return SuccessResponse("Optimization configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("cache/info")]
    public async Task<IActionResult> GetCacheInfo()
    {
        try
        {
            var info = await _optimizationConfigService.GetCacheInfoAsync();
            return SuccessResponse("Success", info);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("cache/clear")]
    public async Task<IActionResult> ClearCache()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            await _optimizationConfigService.ClearCacheAsync();
            return SuccessResponse("Cache cleared successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("version/increment")]
    public async Task<IActionResult> IncrementVersion()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var version = await _optimizationConfigService.IncrementVersionAsync();
            return SuccessResponse("Version incremented", new { Version = version });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("rebuild")]
    public async Task<IActionResult> Rebuild()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            await _optimizationConfigService.ClearCacheAsync();
            var version = await _optimizationConfigService.IncrementVersionAsync();
            return SuccessResponse("Bundles rebuilt successfully", new { Version = version });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    //[HttpGet("bundles")]
    //public async Task<IActionResult> GetBundles()
    //{
    //    try
    //    {
    //        var smidgeDir = Path.Combine(
    //            ((IWebHostEnvironment)HttpContext.RequestServices.GetService(typeof(IWebHostEnvironment)))
    //            ?.ContentRootPath ?? "", "smidge");
    //        var bundles = new List<object>();
    //        if (Directory.Exists(smidgeDir))
    //        {
    //            foreach (var file in Directory.GetFiles(smidgeDir, "*.combined.*"))
    //            {
    //                var fi = new FileInfo(file);
    //                bundles.Add(new
    //                {
    //                    Name = Path.GetFileName(file),
    //                    Size = fi.Length,
    //                    LastModified = fi.LastWriteTimeUtc,
    //                    Type = file.EndsWith(".css") ? "CSS" : "JS"
    //                });
    //            }
    //        }
    //        return SuccessResponse("Success", bundles);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}
}
