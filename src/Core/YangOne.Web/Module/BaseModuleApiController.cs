// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Web.API;
using YangOne.Web.Dto;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Shared module API surface inherited by package module controllers.
    /// </summary>
    public abstract class BaseModuleApiController : BaseApiController
    {
        private readonly IModuleService _moduleService;

        protected BaseModuleApiController(IModuleService moduleService)
        {
            _moduleService = moduleService;
        }

        protected abstract string ModuleName { get; }

        [HttpGet("module-info")]
        public virtual async Task<ActionResult<ApiResponse<ModuleApiInfoDto>>> GetModuleInfo()
        {
            var module = await _moduleService.GetByNameAsync(ModuleName);
            if (module == null)
                return ErrorResponse<ModuleApiInfoDto>(404, "Module info was not found.");

            return SuccessResponse("Success", CreateModuleApiInfo(module));
        }

        [HttpGet("module-version")]
        public virtual async Task<ActionResult<ApiResponse<ModuleVersionDto>>> GetModuleVersion()
        {
            var module = await _moduleService.GetByNameAsync(ModuleName);
            if (module == null)
                return ErrorResponse<ModuleVersionDto>(404, "Module info was not found.");

            return SuccessResponse("Success", new ModuleVersionDto
            {
                ModuleName = module.ModuleKey ?? module.Name,
                Version = module.ActiveVersion ?? module.Version,
                LifecycleState = module.LifecycleState ?? string.Empty,
                RuntimeState = module.RuntimeState ?? string.Empty,
                IsActive = module.IsActive,
                IsInstalled = module.IsInstalled
            });
        }

        private static ModuleApiInfoDto CreateModuleApiInfo(ModuleInfo module)
        {
            return new ModuleApiInfoDto
            {
                ModuleName = module.ModuleKey ?? module.Name,
                DisplayName = module.DisplayName ?? module.Name,
                Description = module.Description ?? string.Empty,
                Version = module.Version ?? string.Empty,
                ActiveVersion = module.ActiveVersion ?? module.Version ?? string.Empty,
                StagedVersion = module.StagedVersion ?? string.Empty,
                LifecycleState = module.LifecycleState ?? string.Empty,
                RuntimeState = module.RuntimeState ?? string.Empty,
                IsActive = module.IsActive,
                IsInstalled = module.IsInstalled,
                IsRestartRequired = module.IsRestartRequired,
                PackagePath = module.PackagePath ?? string.Empty
            };
        }
    }


}
