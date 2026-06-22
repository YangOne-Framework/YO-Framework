// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Module;
using System.Collections.Generic;

namespace YandOne.Admin.API;

[Route("api/v1/module")]
/// <summary>
/// Represents a class ModuleApiController.
/// </summary>
public class ModuleApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IModuleManager _moduleManager;
    private readonly IModuleService _moduleService;

    public ModuleApiController(
        ILogger logger,
        IModuleManager moduleManager,
        IModuleService moduleService)
    {
        _logger = logger;
        _moduleManager = moduleManager;
        _moduleService = moduleService;
    }

    // GET: api/v1/module/all?pageNo=1&pageSize=8&status=1&query=
    //   status: -1 = All, 0 = Disabled, 1 = Installed (default), 2 = Uninstalled
    [HttpGet]
    [Route("all")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> GetPaged(
        [FromQuery] int pageNo = 1,
        [FromQuery] int pageSize = 8,
        [FromQuery] int status = 1,
        [FromQuery] string query = "")
    {
        try
        {
            var conditions = "Where IsDeleted = 0";
            var parameters = new Dictionary<string, object>();

            if (status != -1)
            {
                if (status == 1)
                    conditions += " AND IsInstalled = 1 AND IsActive = 1";
                else if (status == 2)
                    conditions += " AND IsInstalled = 0";
                else
                    conditions += " AND IsInstalled = 1 AND IsActive = 0";
            }

            if (!string.IsNullOrWhiteSpace(query))
            {
                conditions += " AND (Name LIKE @Query OR DisplayName LIKE @Query)";
                parameters["Query"] = $"%{query}%";
            }

            var data = await _moduleService.Service.GetListPagedAsync(
                pageNo, pageSize, pageSize, conditions, "AddedOn desc", parameters);
            return SuccessResponse("Success", (object)data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("upload")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<ModulePackageValidationResult>>> Upload([FromForm] ModulePackageUploadRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<ModulePackageValidationResult>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            if (request.PackageFile == null || request.PackageFile.Length == 0)
                return ErrorResponse<ModulePackageValidationResult>(400, "Module package is required.");

            await using var stream = request.PackageFile.OpenReadStream();
            var result = await _moduleManager.UploadPackageAsync(stream, request.PackageFile.FileName, userId);
            if (!result.IsValid)
            {
                var response = CreateResponse(400, "Module package validation failed.", result, result.Errors.ToArray());
                return BadRequest(response);
            }

            return SuccessResponse("Module package uploaded successfully.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModulePackageValidationResult>(501, e.Message);
        }
    }

   
    [HttpPost("install")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Install(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<object>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            if (string.IsNullOrWhiteSpace(request.ModuleName))
                return ErrorResponse<object>(400, "Invalid module.");

            var module = await _moduleManager.FindAsync(request.ModuleName);
            if (module == null || module is ManifestModule || !string.IsNullOrWhiteSpace(request.Version))
            {
                var result = await _moduleManager.InstallPackageAsync(request.ModuleName, request.Version, userId);
                if (!result.Succeeded)
                    return ErrorResponse<object>(500, result.Message);

                return SuccessResponse("Module installed successfully.", (object)result);
            }

            var ok = await _moduleManager.InstallAsync(module);
            if (!ok)
                return ErrorResponse<object>(500, "Module installation failed.");

            return SuccessResponse("Module installed successfully.", (object)true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpPost("enable")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ModuleOperationResult>>> Enable(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<ModuleOperationResult>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            var result = await _moduleManager.EnableAsync(request.ModuleName, userId);
            if (!result.Succeeded)
                return ErrorResponse<ModuleOperationResult>(500, result.Message);

            return SuccessResponse("Module enabled successfully.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModuleOperationResult>(501, e.Message);
        }
    }

    [HttpPost("disable")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ModuleOperationResult>>> Disable(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<ModuleOperationResult>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            var result = await _moduleManager.DisableAsync(request.ModuleName, userId);
            if (!result.Succeeded)
                return ErrorResponse<ModuleOperationResult>(500, result.Message);

            return SuccessResponse("Module disabled successfully.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModuleOperationResult>(501, e.Message);
        }
    }

    [HttpPost("upgrade")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ModuleOperationResult>>> Upgrade(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<ModuleOperationResult>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            var result = await _moduleManager.UpgradeAsync(request.ModuleName, request.Version, userId);
            if (!result.Succeeded)
                return ErrorResponse<ModuleOperationResult>(500, result.Message);

            return SuccessResponse("Module upgraded successfully.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModuleOperationResult>(501, e.Message);
        }
    }

    [HttpPost("rollback")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ModuleOperationResult>>> Rollback(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<ModuleOperationResult>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            var result = await _moduleManager.RollbackAsync(request.ModuleName, request.Version, userId);
            if (!result.Succeeded)
                return ErrorResponse<ModuleOperationResult>(500, result.Message);

            return SuccessResponse("Module rolled back successfully.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModuleOperationResult>(501, e.Message);
        }
    }
    
    [HttpPost("uninstall")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<object>>> Uninstall(ModuleActionRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse<object>(ModelState, 600, request);

        try
        {
            var userId = GetRequestedBy();

            if (string.IsNullOrWhiteSpace(request.ModuleName))
                return ErrorResponse<object>(400, "Invalid module.");

            var module = await _moduleManager.FindAsync(request.ModuleName);
            if (module == null || module is ManifestModule || request.PurgeData)
            {
                var result = await _moduleManager.UninstallPackageAsync(request.ModuleName, request.PurgeData, userId);
                if (!result.Succeeded)
                    return ErrorResponse<object>(500, result.Message);

                return SuccessResponse("Module uninstalled successfully.", (object)result);
            }

            var ok = await _moduleManager.UnInstallAsync(module);
            if (!ok)
                return ErrorResponse<object>(500, "Module uninstallation failed.");

            return SuccessResponse("Module uninstalled successfully.", (object)true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<object>(501, e.Message);
        }
    }

    [HttpGet("{moduleName}/ping")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<ModuleOperationResult>>> Ping(string moduleName)
    {
        try
        {
            var result = await _moduleManager.PingAsync(moduleName);
            if (!result.Succeeded)
                return ErrorResponse<ModuleOperationResult>(500, result.Message);

            return SuccessResponse("Module ping succeeded.", result);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ModuleOperationResult>(501, e.Message);
        }
    }

    [HttpGet("{moduleName}/journal")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<IEnumerable<ModuleOperationJournal>>>> Journal(string moduleName, [FromQuery] int count = 50)
    {
        try
        {
            var data = await _moduleManager.GetOperationJournalAsync(moduleName, count);
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<ModuleOperationJournal>>(501, e.Message);
        }
    }

    private long GetRequestedBy()
    {
        var userId = User.Identity.GetIdentityUserId();
        return userId > 0 ? userId : -1;
    }
}

