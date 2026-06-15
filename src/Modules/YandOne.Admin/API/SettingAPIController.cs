using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Security;
using YangOne.Storage;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Optimizer;
using YangOne.Web.Security;
using YangOne.Web.Security.API;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/setting")]
public class SettingApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly ISettingService _settingService;
    private readonly IHostApplicationLifetime _applicationLifetime;
    private readonly ICSPManager _cspManager;
    private readonly IApiConfigService _apiConfigService;
    private readonly IOptimizationConfigService _optimizationConfigService;
    private readonly IFileConfigService _fileConfigService;
    private readonly IAppBasicSecurityService _appBasicSecurityService;
    private readonly IStorageProvider _storageProvider;

    public SettingApiController(
        ILogger logger,
        ISettingService settingService,
        IHostApplicationLifetime applicationLifetime,
        ICSPManager cspManager,
        IApiConfigService apiConfigService,
        IOptimizationConfigService optimizationConfigService,
        IFileConfigService fileConfigService,
        IAppBasicSecurityService appBasicSecurityService,
        IStorageProvider storageProvider)
    {
        _logger = logger;
        _settingService = settingService;
        _applicationLifetime = applicationLifetime;
        _cspManager = cspManager;
        _apiConfigService = apiConfigService;
        _optimizationConfigService = optimizationConfigService;
        _fileConfigService = fileConfigService;
        _appBasicSecurityService = appBasicSecurityService;
        _storageProvider = storageProvider;
    }

    #region Web Settings

    [HttpGet("web")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetWebSetting()
    {
        try
        {
            var setting = await _settingService.CrudService.GetAsync(1);
            return SuccessResponse("Success", setting);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("web/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveWebSetting([FromForm] Setting model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();

            if (model.LogoFile != null)
            {
                model.Logo = await _storageProvider.Save("Logo", model.LogoFile);
            }

            await _settingService.SaveSetting(model, userId);
            return SuccessResponse("Web settings saved successfully", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Application Control

    [HttpPost("app/restart")]
    [Authorize(Roles = "SuperUser")]
    public IActionResult Shutdown()
    {
        try
        {
            _applicationLifetime.StopApplication();
            return SuccessResponse("Application shutdown initiated", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region CSP

    [HttpGet("csp")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetCspConfig()
    {
        try
        {
            var config = await _cspManager.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("csp/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveCspConfig([FromBody] CspConfig config)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, config);

        try
        {
            await _cspManager.SaveConfigAsync(config);
            return SuccessResponse("CSP configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region API Config

    [HttpGet("api")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetApiConfig()
    {
        try
        {
            var config = await _apiConfigService.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("api/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveApiConfig([FromBody] ApiConfig model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            // Safety: both encryption and obfuscation cannot be active simultaneously.
            // If both are true, reset both to false.
            if (model.UseEncryption && model.UseObfusication)
            {
                model.UseEncryption = false;
                model.UseObfusication = false;
            }

            // Preserve existing keys if not provided in the save payload
            var existing = await _apiConfigService.GetConfigAsync();
            if (string.IsNullOrEmpty(model.ObfuscationKey))
                model.ObfuscationKey = existing.ObfuscationKey;
            if (string.IsNullOrEmpty(model.EncryptionKey))
                model.EncryptionKey = existing.EncryptionKey;
            if (string.IsNullOrEmpty(model.EncryptionIV))
                model.EncryptionIV = existing.EncryptionIV;

            await _apiConfigService.SaveConfigAsync(model);
            return SuccessResponse("API configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Optimization

    [HttpGet("optimization")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetOptimizationConfig()
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

    [HttpPost("optimization/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveOptimizationConfig([FromBody] OptimizationConfig model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            await _optimizationConfigService.SaveConfigAsync(model);
            return SuccessResponse("Optimization configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region File Config

    [HttpGet("file")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetFileConfig()
    {
        try
        {
            var config = await _fileConfigService.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("file/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveFileConfig([FromBody] FileConfig config)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, config);

        try
        {
            await _fileConfigService.SaveConfigAsync(config);
            return SuccessResponse("File configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion

    #region Basic Security

    [HttpGet("basic")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetBasicSecurityConfig()
    {
        try
        {
            var config = await _appBasicSecurityService.GetConfigAsync();
            return SuccessResponse("Success", config);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("basic/save")]
    // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SaveBasicSecurityConfig([FromBody] AppBasicSecurity model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            await _appBasicSecurityService.SaveConfigAsync(model);
            return SuccessResponse("Basic security configuration saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    #endregion
}