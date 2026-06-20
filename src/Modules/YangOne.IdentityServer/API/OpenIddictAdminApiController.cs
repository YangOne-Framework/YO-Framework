// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using OpenIddict.Abstractions;
using YangOne.IdentityServer.Dto;
using YangOne.Log;
using YangOne.Web.API;

namespace YangOne.IdentityServer.Api;


[Route("api/v1/openiddict")]
/// <summary>
/// Represents a class OpenIddictAdminApiController.
/// </summary>
public class OpenIddictAdminApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly IOpenIddictAuthorizationManager _authorizationManager;
    private readonly IOpenIddictTokenManager _tokenManager;

    public OpenIddictAdminApiController(
        ILogger logger,
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager,
        IOpenIddictAuthorizationManager authorizationManager,
        IOpenIddictTokenManager tokenManager)
    {
        _logger = logger;
        _applicationManager = applicationManager;
        _scopeManager = scopeManager;
        _authorizationManager = authorizationManager;
        _tokenManager = tokenManager;
    }



    #region Dashboard

    [HttpGet("dashboard/stat")]
    public async Task<ActionResult<ApiResponse<DashboardDto>>> Dashboard()
    {
        try
        {
            var dto = new DashboardDto
            {
                ApplicationCount = await CountAsync(_applicationManager.ListAsync()),
                ScopeCount = await CountAsync(_scopeManager.ListAsync()),
                TokenCount = await CountAsync(_tokenManager.ListAsync()),
                AuthorizationCount = await CountAsync(_authorizationManager.ListAsync())
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<DashboardDto>(501, e.Message);
        }
    }

    private static async Task<int> CountAsync<T>(IAsyncEnumerable<T> stream)
    {
        var count = 0;
        await foreach (var _ in stream) count++;
        return count;
    }

    #endregion

    #region Helpers / Metadata (same info your MVC used)

    [HttpGet("consenttype/all")]
    public ActionResult<ApiResponse<object>> GetConsentTypes()
        => SuccessResponse("Success", (object)new List<string>
        {
            OpenIddictConstants.ConsentTypes.Explicit,
            OpenIddictConstants.ConsentTypes.Implicit,
            OpenIddictConstants.ConsentTypes.External,
            OpenIddictConstants.ConsentTypes.Systematic
        });

    // Your MVC method name was misleading; these are CLIENT TYPES, not grant types.
    [HttpGet("clienttype/all")]
    public ActionResult<ApiResponse<object>> GetClientTypes()
        => SuccessResponse("Success", (object)new List<string>
        {
            OpenIddictConstants.ClientTypes.Public,
            OpenIddictConstants.ClientTypes.Confidential
        });

    [HttpGet("permission/all")]
    public async Task<ActionResult<ApiResponse<object>>> GetPermissions()
    {
        try
        {
            var perms = await GetAvailablePermissionsInternal();
            return SuccessResponse("Success", (object)perms);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    private async Task<List<string>> GetAvailablePermissionsInternal()
    {
        var scopes = new List<string>();
        await foreach (var scope in _scopeManager.ListAsync())
        {
            var name = await _scopeManager.GetNameAsync(scope);
            if (!string.IsNullOrWhiteSpace(name)) scopes.Add(name);
        }

        var list = new List<string>
        {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Token,
            OpenIddictConstants.Permissions.Endpoints.DeviceAuthorization,

            OpenIddictConstants.Permissions.GrantTypes.AuthorizationCode,
            OpenIddictConstants.Permissions.GrantTypes.ClientCredentials,
            OpenIddictConstants.Permissions.GrantTypes.DeviceCode,
            OpenIddictConstants.Permissions.GrantTypes.Implicit,
            OpenIddictConstants.Permissions.GrantTypes.Password,
            OpenIddictConstants.Permissions.GrantTypes.RefreshToken,

            OpenIddictConstants.Permissions.ResponseTypes.Code,
            OpenIddictConstants.Permissions.ResponseTypes.CodeIdToken,
            OpenIddictConstants.Permissions.ResponseTypes.CodeIdTokenToken,
            OpenIddictConstants.Permissions.ResponseTypes.CodeToken,
            OpenIddictConstants.Permissions.ResponseTypes.IdToken,
            OpenIddictConstants.Permissions.ResponseTypes.IdTokenToken,
            OpenIddictConstants.Permissions.ResponseTypes.None,
            OpenIddictConstants.Permissions.ResponseTypes.Token,

            OpenIddictConstants.Permissions.Scopes.Address,
            OpenIddictConstants.Permissions.Scopes.Email,
            OpenIddictConstants.Permissions.Scopes.Phone,
            OpenIddictConstants.Permissions.Scopes.Profile,
            OpenIddictConstants.Permissions.Scopes.Roles
        };

        list.AddRange(scopes);
        return list;
    }

    #endregion

    //#region Clients (API for your MVC Clients actions)

    //[HttpGet("client/all")]
    //public async Task<ActionResult<ApiResponse<object>>> Clients([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string query = "")
    //{
    //    try
    //    {
    //        var (items, total) = await PageApplicationsAsync(offset, limit, query, includeAllApps: true);

    //        var dto = new PagedResult<ClientListItemDto>
    //        {
    //            Offset = offset,
    //            Limit = limit,
    //            Total = total,
    //            Items = items.Select(a => new ClientListItemDto
    //            {
    //                Id = a.Id,
    //                ClientId = a.ClientId,
    //                DisplayName = a.DisplayName,
    //                ClientType = a.ClientType,
    //                ConsentType = a.ConsentType
    //            }).ToList()
    //        };

    //        return SuccessResponse("Success", dto);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpGet("client/{id}")]
    //public async Task<ActionResult<ApiResponse<object>>> ClientDetails(string id)
    //{
    //    try
    //    {
    //        var app = await _applicationManager.FindByIdAsync(id);
    //        if (app == null) return ErrorResponse(404, "Client not found");

    //        var perms = (await _applicationManager.GetPermissionsAsync(app)).ToList();

    //        var dto = new ClientDetailsDto
    //        {
    //            Id = id,
    //            ClientId = await _applicationManager.GetClientIdAsync(app) ?? "",
    //            DisplayName = await _applicationManager.GetDisplayNameAsync(app),
    //            ClientType = await _applicationManager.GetClientTypeAsync(app),
    //            ConsentType = await _applicationManager.GetConsentTypeAsync(app),
    //            RedirectUris = (await _applicationManager.GetRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
    //            PostLogoutRedirectUris = (await _applicationManager.GetPostLogoutRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
    //            Permissions = perms,
    //            Requirements = (await _applicationManager.GetRequirementsAsync(app)).ToList(),
    //            GrantTypes = perms
    //                .Where(p => p.StartsWith(OpenIddictConstants.Permissions.Prefixes.GrantType, StringComparison.Ordinal))
    //                .Select(p => p[OpenIddictConstants.Permissions.Prefixes.GrantType.Length..])
    //                .ToList()
    //        };

    //        return SuccessResponse("Success", dto);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpPost("client/save")]
    //public async Task<ActionResult<ApiResponse<object>>> CreateClient([FromBody] CreateOrUpdateClientRequest model)
    //{
    //    if (!ModelState.IsValid) return ErrorResponse(ModelState, 600, model);

    //    try
    //    {
    //        var descriptor = new OpenIddictApplicationDescriptor
    //        {
    //            ClientId = model.ClientId,
    //            ClientSecret = model.ClientSecret,
    //            DisplayName = model.DisplayName,
    //            ClientType = model.ClientType,
    //            ConsentType = model.ConsentType
    //        };

    //        AddUris(descriptor.RedirectUris, model.RedirectUris);
    //        AddUris(descriptor.PostLogoutRedirectUris, model.PostLogoutRedirectUris);
    //        AddStrings(descriptor.Permissions, model.Permissions);

    //        await _applicationManager.CreateAsync(descriptor);
    //        return SuccessResponse("Created successfully", true);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpPost("client/update")]
    //public async Task<ActionResult<ApiResponse<object>>> EditClient([FromBody] CreateOrUpdateClientRequest model)
    //{
    //    if (!ModelState.IsValid) return ErrorResponse(ModelState, 600, model);

    //    try
    //    {
    //        var app = await _applicationManager.FindByIdAsync(model.ClientId);
    //        if (app == null) return ErrorResponse(404, "Client not found");

    //        var descriptor = new OpenIddictApplicationDescriptor
    //        {
    //            ClientId = model.ClientId,
    //            DisplayName = model.DisplayName,
    //            ClientType = model.ClientType,
    //            ConsentType = model.ConsentType
    //        };

    //        // Only update secret if provided (matches your MVC logic intent)
    //        if (!string.IsNullOrWhiteSpace(model.ClientSecret))
    //            descriptor.ClientSecret = model.ClientSecret;

    //        AddUris(descriptor.RedirectUris, model.RedirectUris);
    //        AddUris(descriptor.PostLogoutRedirectUris, model.PostLogoutRedirectUris);
    //        AddStrings(descriptor.Permissions, model.Permissions);

    //        await _applicationManager.UpdateAsync(app, descriptor);
    //        return SuccessResponse("Updated successfully", true);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpDelete("client/{id}")]
    //public async Task<ActionResult<ApiResponse<object>>> DeleteClient(string id)
    //{
    //    try
    //    {
    //        var app = await _applicationManager.FindByIdAsync(id);
    //        if (app == null) return ErrorResponse(404, "Client not found");

    //        await _applicationManager.DeleteAsync(app);
    //        return SuccessResponse("Deleted successfully", true);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //#endregion

    #region Applications (API for your MVC Applications actions)

    [HttpGet("application/all")]
    public async Task<ActionResult<ApiResponse<object>>> Applications([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string search = "")
    {
        try
        {
            var (items, total) = await PageApplicationsAsync(offset, limit, search, includeAllApps: true);



            return SuccessResponse("Success", (object)new { RowTotal = total, Rows = items });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    // MVC had "applications/details/{id}"
    [HttpGet("application/detail/{id}")]
    public async Task<ActionResult<ApiResponse<ApplicationDetailsDto>>> ApplicationDetails(string id)
    {
        try
        {
            var app = await _applicationManager.FindByIdAsync(id);
            if (app == null) return ErrorResponse<ApplicationDetailsDto>(404, "Application not found");

            var perms = (await _applicationManager.GetPermissionsAsync(app)).ToList();

            var dto = new ApplicationDetailsDto
            {
                Id = id,
                ClientId = await _applicationManager.GetClientIdAsync(app) ?? "",
                DisplayName = await _applicationManager.GetDisplayNameAsync(app),
                ClientType = await _applicationManager.GetClientTypeAsync(app),
                ConsentType = await _applicationManager.GetConsentTypeAsync(app),
                RedirectUris = (await _applicationManager.GetRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                PostLogoutRedirectUris = (await _applicationManager.GetPostLogoutRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                Permissions = perms,
                Requirements = (await _applicationManager.GetRequirementsAsync(app)).ToList(),
                GrantTypes = perms
                    .Where(p => p.StartsWith(OpenIddictConstants.Permissions.Prefixes.GrantType, StringComparison.Ordinal))
                    .Select(p => p[OpenIddictConstants.Permissions.Prefixes.GrantType.Length..])
                    .ToList()
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApplicationDetailsDto>(501, e.Message);
        }
    }

    [HttpPost("application/save")]
    public async Task<ActionResult<ApiResponse<ApplicationDetailsDto>>> EditApplication([FromBody] CreateOrUpdateApplicationRequest model)
    {
        if (!ModelState.IsValid) return ErrorResponse<ApplicationDetailsDto>(ModelState, 600, model);

        try
        {
            if (string.IsNullOrEmpty(model.Id))
            {


                var descriptor = new OpenIddictApplicationDescriptor
                {
                    ClientId = model.ClientId,
                    ClientSecret = model.ClientSecret,
                    DisplayName = model.DisplayName,
                    ClientType = model.ClientType,
                    ConsentType = model.ConsentType
                };

                AddUris(descriptor.RedirectUris, model.RedirectUris);
                AddUris(descriptor.PostLogoutRedirectUris, model.PostLogoutRedirectUris);
                AddStrings(descriptor.Permissions, model.Permissions);
                var x = OpenIddictConstants.Requirements.Features.ProofKeyForCodeExchange;
                await _applicationManager.CreateAsync(descriptor);

                var app = await _applicationManager.FindByClientIdAsync(model.ClientId);
                var perms = (await _applicationManager.GetPermissionsAsync(app)).ToList();

                var dto = new ApplicationDetailsDto
                {
                    Id = await _applicationManager.GetIdAsync(app) ?? "",
                    ClientId = await _applicationManager.GetClientIdAsync(app) ?? "",
                    DisplayName = await _applicationManager.GetDisplayNameAsync(app),
                    ClientType = await _applicationManager.GetClientTypeAsync(app),
                    ConsentType = await _applicationManager.GetConsentTypeAsync(app),
                    RedirectUris = (await _applicationManager.GetRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                    PostLogoutRedirectUris = (await _applicationManager.GetPostLogoutRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                    Permissions = perms,
                    Requirements = (await _applicationManager.GetRequirementsAsync(app)).ToList(),
                    GrantTypes = perms
                        .Where(p => p.StartsWith(OpenIddictConstants.Permissions.Prefixes.GrantType, StringComparison.Ordinal))
                        .Select(p => p[OpenIddictConstants.Permissions.Prefixes.GrantType.Length..])
                        .ToList()
                };

                return SuccessResponse("Saved successfully", dto);
            }
            else
            {
                var app = await _applicationManager.FindByIdAsync(model.Id);
                if (app == null) return ErrorResponse<ApplicationDetailsDto>(404, "Application not found");

                var descriptor = new OpenIddictApplicationDescriptor
                {
                    ClientId = model.ClientId,
                    DisplayName = model.DisplayName,
                    ClientType = model.ClientType,
                    ConsentType = model.ConsentType
                };

                if (!string.IsNullOrWhiteSpace(model.ClientSecret))
                    descriptor.ClientSecret = model.ClientSecret;

                AddUris(descriptor.RedirectUris, model.RedirectUris);
                AddUris(descriptor.PostLogoutRedirectUris, model.PostLogoutRedirectUris);
                AddStrings(descriptor.Permissions, model.Permissions);

                await _applicationManager.UpdateAsync(app, descriptor);

                var perms = (await _applicationManager.GetPermissionsAsync(app)).ToList();

                var dto = new ApplicationDetailsDto
                {
                    Id = model.Id,
                    ClientId = await _applicationManager.GetClientIdAsync(app) ?? "",
                    DisplayName = await _applicationManager.GetDisplayNameAsync(app),
                    ClientType = await _applicationManager.GetClientTypeAsync(app),
                    ConsentType = await _applicationManager.GetConsentTypeAsync(app),
                    RedirectUris = (await _applicationManager.GetRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                    PostLogoutRedirectUris = (await _applicationManager.GetPostLogoutRedirectUrisAsync(app)).Select(u => u.ToString()).ToList(),
                    Permissions = perms,
                    Requirements = (await _applicationManager.GetRequirementsAsync(app)).ToList(),
                    GrantTypes = perms
                        .Where(p => p.StartsWith(OpenIddictConstants.Permissions.Prefixes.GrantType, StringComparison.Ordinal))
                        .Select(p => p[OpenIddictConstants.Permissions.Prefixes.GrantType.Length..])
                        .ToList()
                };

                return SuccessResponse("Updated successfully", dto);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApplicationDetailsDto>(501, e.Message);
        }
    }

    [HttpDelete("application/delete/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteApplication(string id)
    {
        try
        {
            var app = await _applicationManager.FindByIdAsync(id);
            if (app == null) return ErrorResponse<bool>(404, "Application not found");

            await _applicationManager.DeleteAsync(app);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region API Resources (rs_*) - create/edit/delete/list

    [HttpGet("apiresource/all")]
    public async Task<ActionResult<ApiResponse<PagedResult<ApiResourceDto>>>> ApiResources([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string search = "")
    {
        try
        {
            var all = new List<ApiResourceDto>();

            await foreach (var scope in _scopeManager.ListAsync())
            {
                var name = await _scopeManager.GetNameAsync(scope);
                if (string.IsNullOrWhiteSpace(name) || !name.StartsWith("rs_", StringComparison.Ordinal)) continue;

                var display = await _scopeManager.GetDisplayNameAsync(scope);
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var plain = name.Length > 3 ? name[3..] : name;
                    var ok =
                        plain.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (!string.IsNullOrWhiteSpace(display) && display.Contains(search, StringComparison.OrdinalIgnoreCase));
                    if (!ok) continue;
                }

                all.Add(new ApiResourceDto
                {
                    Id = await _scopeManager.GetIdAsync(scope) ?? "",
                    Name = name.Length > 3 ? name[3..] : name,
                    DisplayName = display,
                    Description = await _scopeManager.GetDescriptionAsync(scope)
                });
            }

            var dto = Page(all, offset, limit);
            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<PagedResult<ApiResourceDto>>(501, e.Message);
        }
    }

    [HttpGet("apiresource/{id}")]
    public async Task<ActionResult<ApiResponse<ApiResourceDto>>> ApiResourceDetails(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<ApiResourceDto>(404, "API resource not found");

            var name = await _scopeManager.GetNameAsync(scope) ?? "";
            if (!name.StartsWith("rs_", StringComparison.Ordinal))
                return ErrorResponse<ApiResourceDto>(400, "Not an API resource (expected rs_* scope)");

            var dto = new ApiResourceDto
            {
                Id = id,
                Name = name.Length > 3 ? name[3..] : name,
                DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
                Description = await _scopeManager.GetDescriptionAsync(scope)
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiResourceDto>(501, e.Message);
        }
    }

    [HttpPost("apiresource/save")]
    public async Task<ActionResult<ApiResponse<ApiResourceDto>>> CreateApiResource([FromBody] ApiResourceDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<ApiResourceDto>(ModelState, 600, model);

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "rs_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add("rs_" + model.Name);

            await _scopeManager.CreateAsync(descriptor);

            var scope = await _scopeManager.FindByNameAsync("rs_" + model.Name);
            var dto = new ApiResourceDto
            {
                Id = await _scopeManager.GetIdAsync(scope) ?? "",
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Created successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiResourceDto>(501, e.Message);
        }
    }

    [HttpPost("apiresource/update")]
    public async Task<ActionResult<ApiResponse<ApiResourceDto>>> EditApiResource([FromBody] ApiResourceDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<ApiResourceDto>(ModelState, 600, model);

        try
        {
            var scope = await _scopeManager.FindByIdAsync(model.Id);
            if (scope == null) return ErrorResponse<ApiResourceDto>(404, "API resource not found");

            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "rs_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add("rs_" + model.Name);

            await _scopeManager.UpdateAsync(scope, descriptor);

            var dto = new ApiResourceDto
            {
                Id = model.Id,
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Updated successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiResourceDto>(501, e.Message);
        }
    }

    [HttpDelete("apiresource/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteApiResource(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<bool>(404, "API resource not found");

            await _scopeManager.DeleteAsync(scope);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region Identity Resources (not rs_ and not api_)

    [HttpGet("identityresource/all")]
    public async Task<ActionResult<ApiResponse<PagedResult<IdentityResourceDto>>>> IdentityResources([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string search = "")
    {
        try
        {
            var all = new List<IdentityResourceDto>();

            await foreach (var scope in _scopeManager.ListAsync())
            {
                var name = await _scopeManager.GetNameAsync(scope);
                if (string.IsNullOrWhiteSpace(name)) continue;
                if (name.StartsWith("rs_", StringComparison.Ordinal) || name.StartsWith("api_", StringComparison.Ordinal)) continue;

                var display = await _scopeManager.GetDisplayNameAsync(scope);
                if (!string.IsNullOrWhiteSpace(search))
                {
                    var ok =
                        name.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (!string.IsNullOrWhiteSpace(display) && display.Contains(search, StringComparison.OrdinalIgnoreCase));
                    if (!ok) continue;
                }

                all.Add(new IdentityResourceDto
                {
                    Id = await _scopeManager.GetIdAsync(scope) ?? "",
                    Name = name,
                    DisplayName = display,
                    Description = await _scopeManager.GetDescriptionAsync(scope)
                });
            }

            var dto = Page(all, offset, limit);
            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<PagedResult<IdentityResourceDto>>(501, e.Message);
        }
    }

    [HttpGet("identityresource/{id}")]
    public async Task<ActionResult<ApiResponse<IdentityResourceDto>>> IdentityResourceDetails(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<IdentityResourceDto>(404, "Identity resource not found");

            var dto = new IdentityResourceDto
            {
                Id = id,
                Name = await _scopeManager.GetNameAsync(scope) ?? "",
                DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
                Description = await _scopeManager.GetDescriptionAsync(scope)
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IdentityResourceDto>(501, e.Message);
        }
    }

    [HttpPost("identityresource/save")]
    public async Task<ActionResult<ApiResponse<IdentityResourceDto>>> CreateIdentityResource([FromBody] IdentityResourceDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<IdentityResourceDto>(ModelState, 600, model);

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add(model.Name);

            await _scopeManager.CreateAsync(descriptor);

            var scope = await _scopeManager.FindByNameAsync(model.Name);
            var dto = new IdentityResourceDto
            {
                Id = await _scopeManager.GetIdAsync(scope) ?? "",
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Created successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IdentityResourceDto>(501, e.Message);
        }
    }

    [HttpPost("identityresource/update")]
    public async Task<ActionResult<ApiResponse<IdentityResourceDto>>> EditIdentityResource([FromBody] IdentityResourceDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<IdentityResourceDto>(ModelState, 600, model);

        try
        {
            var scope = await _scopeManager.FindByIdAsync(model.Id);
            if (scope == null) return ErrorResponse<IdentityResourceDto>(404, "Identity resource not found");

            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add(model.Name);

            await _scopeManager.UpdateAsync(scope, descriptor);

            var dto = new IdentityResourceDto
            {
                Id = model.Id,
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Updated successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IdentityResourceDto>(501, e.Message);
        }
    }

    [HttpDelete("identityresource/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIdentityResource(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<bool>(404, "Identity resource not found");

            await _scopeManager.DeleteAsync(scope);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region API Scopes (api_*)

    [HttpGet("apiscope/all")]
    public async Task<ActionResult<ApiResponse<PagedResult<ApiScopeDto>>>> ApiScopes([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string search = "")
    {
        try
        {
            var all = new List<ApiScopeDto>();

            await foreach (var scope in _scopeManager.ListAsync())
            {
                var name = await _scopeManager.GetNameAsync(scope);
                if (string.IsNullOrWhiteSpace(name) || !name.StartsWith("api_", StringComparison.Ordinal)) continue;

                var plain = name.Length > 4 ? name[4..] : name;
                var display = await _scopeManager.GetDisplayNameAsync(scope);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var ok =
                        plain.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                        (!string.IsNullOrWhiteSpace(display) && display.Contains(search, StringComparison.OrdinalIgnoreCase));
                    if (!ok) continue;
                }

                all.Add(new ApiScopeDto
                {
                    Id = await _scopeManager.GetIdAsync(scope) ?? "",
                    Name = plain,
                    DisplayName = display,
                    Description = await _scopeManager.GetDescriptionAsync(scope)
                });
            }

            var dto = Page(all, offset, limit);
            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<PagedResult<ApiScopeDto>>(501, e.Message);
        }
    }

    [HttpGet("apiscope/{id}")]
    public async Task<ActionResult<ApiResponse<ApiScopeDto>>> ApiScopeDetails(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<ApiScopeDto>(404, "API scope not found");

            var name = await _scopeManager.GetNameAsync(scope) ?? "";
            if (!name.StartsWith("api_", StringComparison.Ordinal))
                return ErrorResponse<ApiScopeDto>(400, "Not an API scope (expected api_* scope)");

            var dto = new ApiScopeDto
            {
                Id = id,
                Name = name.Length > 4 ? name[4..] : name,
                DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
                Description = await _scopeManager.GetDescriptionAsync(scope)
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiScopeDto>(501, e.Message);
        }
    }

    [HttpPost("apiscope/save")]
    public async Task<ActionResult<ApiResponse<ApiScopeDto>>> CreateApiScope([FromBody] ApiScopeDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<ApiScopeDto>(ModelState, 600, model);

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "api_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add("api_" + model.Name);

            await _scopeManager.CreateAsync(descriptor);

            var scope = await _scopeManager.FindByNameAsync("api_" + model.Name);
            var dto = new ApiScopeDto
            {
                Id = await _scopeManager.GetIdAsync(scope) ?? "",
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Created successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiScopeDto>(501, e.Message);
        }
    }

    [HttpPost("apiscope/update")]
    public async Task<ActionResult<ApiResponse<ApiScopeDto>>> EditApiScope([FromBody] ApiScopeDto model)
    {
        if (!ModelState.IsValid) return ErrorResponse<ApiScopeDto>(ModelState, 600, model);

        try
        {
            var scope = await _scopeManager.FindByIdAsync(model.Id);
            if (scope == null) return ErrorResponse<ApiScopeDto>(404, "API scope not found");

            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "api_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };
            descriptor.Resources.Add("api_" + model.Name);

            await _scopeManager.UpdateAsync(scope, descriptor);

            var dto = new ApiScopeDto
            {
                Id = model.Id,
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description
            };

            return SuccessResponse("Updated successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<ApiScopeDto>(501, e.Message);
        }
    }

    [HttpDelete("apiscope/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteApiScope(string id)
    {
        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null) return ErrorResponse<bool>(404, "API scope not found");

            await _scopeManager.DeleteAsync(scope);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region Grants / Authorizations

    [HttpGet("grant/all")]
    public async Task<ActionResult<ApiResponse<PagedResult<GrantListItemDto>>>> Grants([FromQuery] int offset = 1, [FromQuery] int limit = 20, [FromQuery] string search = "")
    {
        try
        {
            var all = new List<GrantListItemDto>();

            await foreach (var authorization in _authorizationManager.ListAsync())
            {
                var subject = await _authorizationManager.GetSubjectAsync(authorization);
                var appId = await _authorizationManager.GetApplicationIdAsync(authorization);
                var app = !string.IsNullOrWhiteSpace(appId) ? await _applicationManager.FindByIdAsync(appId) : null;
                var appName = app != null ? await _applicationManager.GetDisplayNameAsync(app) : null;

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var ok =
                        (!string.IsNullOrWhiteSpace(subject) && subject.Contains(search, StringComparison.OrdinalIgnoreCase)) ||
                        (!string.IsNullOrWhiteSpace(appName) && appName.Contains(search, StringComparison.OrdinalIgnoreCase));
                    if (!ok) continue;
                }

                all.Add(new GrantListItemDto
                {
                    Id = await _authorizationManager.GetIdAsync(authorization) ?? "",
                    Subject = subject,
                    ApplicationName = appName,
                    CreationDate = (DateTimeOffset)await _authorizationManager.GetCreationDateAsync(authorization),
                    Status = await _authorizationManager.GetStatusAsync(authorization),
                    Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList()
                });
            }

            // Most useful to sort grants by creation date desc
            all = all.OrderByDescending(x => x.CreationDate).ToList();

            var dto = Page(all, offset, limit);
            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<PagedResult<GrantListItemDto>>(501, e.Message);
        }
    }

    [HttpGet("grant/{id}")]
    public async Task<ActionResult<ApiResponse<GrantListItemDto>>> GrantDetails(string id)
    {
        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(id);
            if (authorization == null) return ErrorResponse<GrantListItemDto>(404, "Grant not found");

            var appId = await _authorizationManager.GetApplicationIdAsync(authorization);
            var app = !string.IsNullOrWhiteSpace(appId) ? await _applicationManager.FindByIdAsync(appId) : null;

            var dto = new GrantListItemDto
            {
                Id = id,
                Subject = await _authorizationManager.GetSubjectAsync(authorization),
                ApplicationName = app != null ? await _applicationManager.GetDisplayNameAsync(app) : null,
                CreationDate = await _authorizationManager.GetCreationDateAsync(authorization),
                Status = await _authorizationManager.GetStatusAsync(authorization),
                Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList()
            };

            return SuccessResponse("Success", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<GrantListItemDto>(501, e.Message);
        }
    }

    [HttpPost("grant/save")]
    public async Task<ActionResult<ApiResponse<GrantListItemDto>>> CreateGrant([FromBody] CreateGrantRequest model)
    {
        if (!ModelState.IsValid) return ErrorResponse<GrantListItemDto>(ModelState, 600, model);

        try
        {
            var descriptor = new OpenIddictAuthorizationDescriptor
            {
                Subject = model.Subject,
                Status = model.Status,
                Type = OpenIddictConstants.AuthorizationTypes.Permanent
            };

            if (!string.IsNullOrWhiteSpace(model.ApplicationId))
                descriptor.ApplicationId = model.ApplicationId;

            // Your MVC had scopes commented; API supports it.
            foreach (var s in model.Scopes.Where(x => !string.IsNullOrWhiteSpace(x)))
                descriptor.Scopes.Add(s.Trim());

            await _authorizationManager.CreateAsync(descriptor);

            var authorizations = await _authorizationManager.FindBySubjectAsync(model.Subject).ToListAsync();
            var authorization = authorizations.FirstOrDefault();
            if (authorization == null)
            {
                return ErrorResponse<GrantListItemDto>(500, "Authorization not found after creation");
            }
            var appId = await _authorizationManager.GetApplicationIdAsync(authorization);
            var app = !string.IsNullOrWhiteSpace(appId) ? await _applicationManager.FindByIdAsync(appId) : null;

            var dto = new GrantListItemDto
            {
                Id = await _authorizationManager.GetIdAsync(authorization) ?? "",
                Subject = await _authorizationManager.GetSubjectAsync(authorization),
                ApplicationName = app != null ? await _applicationManager.GetDisplayNameAsync(app) : null,
                CreationDate = await _authorizationManager.GetCreationDateAsync(authorization),
                Status = await _authorizationManager.GetStatusAsync(authorization),
                Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList()
            };

            return SuccessResponse("Created successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<GrantListItemDto>(501, e.Message);
        }
    }

    [HttpPost("grant/update")]
    public async Task<ActionResult<ApiResponse<GrantListItemDto>>> EditGrant([FromBody] UpdateGrantRequest model)
    {
        if (!ModelState.IsValid) return ErrorResponse<GrantListItemDto>(ModelState, 600, model);

        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(model.Id);
            if (authorization == null) return ErrorResponse<GrantListItemDto>(404, "Grant not found");

            await _authorizationManager.UpdateAsync(authorization, new OpenIddictAuthorizationDescriptor
            {
                Status = model.Status
            });

            var appId = await _authorizationManager.GetApplicationIdAsync(authorization);
            var app = !string.IsNullOrWhiteSpace(appId) ? await _applicationManager.FindByIdAsync(appId) : null;

            var dto = new GrantListItemDto
            {
                Id = model.Id,
                Subject = await _authorizationManager.GetSubjectAsync(authorization),
                ApplicationName = app != null ? await _applicationManager.GetDisplayNameAsync(app) : null,
                CreationDate = await _authorizationManager.GetCreationDateAsync(authorization),
                Status = await _authorizationManager.GetStatusAsync(authorization),
                Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList()
            };

            return SuccessResponse("Updated successfully", dto);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<GrantListItemDto>(501, e.Message);
        }
    }

    [HttpDelete("grant/{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteGrant(string id)
    {
        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(id);
            if (authorization == null) return ErrorResponse<bool>(404, "Grant not found");

            await _authorizationManager.DeleteAsync(authorization);
            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    // Matches your MVC "grants/revoke" action behavior (delete)
    [HttpPost("grant/revoke")]
    public async Task<ActionResult<ApiResponse<bool>>> RevokeGrant([FromQuery] string id)
    {
        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(id);
            if (authorization == null) return ErrorResponse<bool>(404, "Grant not found");

            await _authorizationManager.DeleteAsync(authorization);
            return SuccessResponse("Revoked successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(501, e.Message);
        }
    }

    #endregion

    #region Shared paging + utilities

    /// <summary>
    /// Represents a class AppRow.
    /// </summary>
    private class AppRow
    {
        public string Id { get; set; } = default!;
        public string ClientId { get; set; } = default!;
        public string DisplayName { get; set; }
        public string ClientType { get; set; }
        public string ConsentType { get; set; }
        public int RowTotal { get; set; }
    }

    private async Task<(List<AppRow> Page, int Total)> PageApplicationsAsync(int offset, int limit, string query, bool includeAllApps)
    {
        // There is no cheap "count" without iterating; we iterate once and page in-memory to keep behavior deterministic.
        // If you later move to EF Core stores directly, replace with IQueryable paging for performance.
        var all = new List<AppRow>();

        await foreach (var app in _applicationManager.ListAsync())
        {
            var id = await _applicationManager.GetIdAsync(app) ?? "";
            var clientId = await _applicationManager.GetClientIdAsync(app) ?? "";
            var displayName = await _applicationManager.GetDisplayNameAsync(app);

            if (!string.IsNullOrWhiteSpace(query))
            {
                var ok =
                    clientId.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                    (!string.IsNullOrWhiteSpace(displayName) && displayName.Contains(query, StringComparison.OrdinalIgnoreCase));
                if (!ok) continue;
            }

            all.Add(new AppRow
            {
                Id = id,
                ClientId = clientId,
                DisplayName = displayName,
                ClientType = await _applicationManager.GetClientTypeAsync(app),
                ConsentType = await _applicationManager.GetConsentTypeAsync(app)
            });
        }

        var total = all.Count;
        var page = all
            .Skip(Math.Max(0, (offset - 1) * limit))
            .Take(Math.Max(1, limit))
            .ToList();

        return (page, total);
    }

    private static PagedResult<T> Page<T>(List<T> all, int offset, int limit)
    {
        var total = all.Count;
        var items = all
            .Skip(Math.Max(0, (offset - 1) * limit))
            .Take(Math.Max(1, limit))
            .ToList();

        return new PagedResult<T>
        {
            Offset = offset,
            Limit = limit,
            Total = total,
            Items = items
        };
    }

    private static void AddUris(ICollection<Uri> target, IEnumerable<string> uris)
    {
        foreach (var u in uris.Where(x => !string.IsNullOrWhiteSpace(x)))
            target.Add(new Uri(u.Trim()));
    }

    private static void AddStrings(ICollection<string> target, IEnumerable<string> values)
    {
        foreach (var v in values.Where(x => !string.IsNullOrWhiteSpace(x)))
            target.Add(v.Trim());
    }

    #endregion
}
