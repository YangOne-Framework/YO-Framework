// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Blocks module-owned routes while a module is disabled, uninstalling or being upgraded.
    /// </summary>
    public class ModuleGateMiddleware
    {
        private readonly RequestDelegate _next;

        public ModuleGateMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            var moduleName = TryGetModuleName(context.Request.Path.Value);
            if (string.IsNullOrWhiteSpace(moduleName))
            {
                await _next(context);
                return;
            }

            var moduleService = context.RequestServices.GetService<IModuleService>();
            if (moduleService == null)
            {
                await _next(context);
                return;
            }

            ModuleInfo moduleInfo;
            try
            {
                moduleInfo = await moduleService.GetByNameAsync(moduleName);
            }
            catch
            {
                await _next(context);
                return;
            }

            if (moduleInfo == null)
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync("Module is not installed.");
                return;
            }

            var lifecycleState = moduleInfo.LifecycleState ?? string.Empty;
            var blockedForOperation = lifecycleState.StartsWith("Pending", StringComparison.OrdinalIgnoreCase)
                                      || lifecycleState.Equals(ModuleLifecycleState.Installing.ToString(), StringComparison.OrdinalIgnoreCase)
                                      || lifecycleState.Equals(ModuleLifecycleState.Upgrading.ToString(), StringComparison.OrdinalIgnoreCase)
                                      || lifecycleState.Equals(ModuleLifecycleState.RollingBack.ToString(), StringComparison.OrdinalIgnoreCase)
                                      || lifecycleState.Equals(ModuleLifecycleState.Uninstalling.ToString(), StringComparison.OrdinalIgnoreCase);

            if (blockedForOperation)
            {
                context.Response.StatusCode = StatusCodes.Status409Conflict;
                await context.Response.WriteAsync($"Module {moduleInfo.ModuleKey ?? moduleInfo.Name} is currently {lifecycleState}.");
                return;
            }

            if (!moduleInfo.IsInstalled || !moduleInfo.IsActive || lifecycleState.Equals(ModuleLifecycleState.Disabled.ToString(), StringComparison.OrdinalIgnoreCase) || lifecycleState.Equals(ModuleLifecycleState.Uninstalled.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsync("Module is not enabled.");
                return;
            }

            await _next(context);
        }

        private static string TryGetModuleName(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
                return string.Empty;

            var parts = path.Split('/', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length >= 3 && parts[0].Equals("api", StringComparison.OrdinalIgnoreCase) && parts[1].Equals("modules", StringComparison.OrdinalIgnoreCase))
                return Uri.UnescapeDataString(parts[2]);

            if (parts.Length >= 2 && parts[0].Equals("module", StringComparison.OrdinalIgnoreCase))
                return Uri.UnescapeDataString(parts[1]);

            if (parts.Length >= 2 && parts[0].Equals("modules", StringComparison.OrdinalIgnoreCase))
                return Uri.UnescapeDataString(parts[1]);

            return string.Empty;
        }
    }
}
