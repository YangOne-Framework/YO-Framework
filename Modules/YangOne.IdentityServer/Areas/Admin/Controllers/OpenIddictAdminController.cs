using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using OpenIddict.Abstractions;
using YangOne.IdentityServer.ViewModel;
namespace YangOne.IdentityServer.Admin.Controllers;

//[Authorize(Roles = "Administrator")]
[Route("admin/openiddict")]
[ApiExplorerSettings(IgnoreApi = true)]

public class OpenIddictAdminController : Controller
{
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly IOpenIddictAuthorizationManager _authorizationManager;
    private readonly IOpenIddictTokenManager _tokenManager;
    private readonly ILogger<OpenIddictAdminController> _logger;

    public OpenIddictAdminController(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictScopeManager scopeManager,
        IOpenIddictAuthorizationManager authorizationManager,
        IOpenIddictTokenManager tokenManager,
        ILogger<OpenIddictAdminController> logger)
    {
        _applicationManager = applicationManager;
        _scopeManager = scopeManager;
        _authorizationManager = authorizationManager;
        _tokenManager = tokenManager;
        _logger = logger;
    }

    #region Dashboard
    [HttpGet("")]
    public async Task<IActionResult> Dashboard()
    {
        var model = new DashboardViewModel
        {
            ApplicationCount = await CountApplicationsAsync(),
            ScopeCount = await CountScopesAsync(),
            TokenCount = await CountTokensAsync(),
            AuthorizationCount = await CountAuthorizationsAsync()
        };
        return View(model);
    }

    private async Task<int> CountApplicationsAsync()
    {
        var count = 0;
        await foreach (var _ in _applicationManager.ListAsync()) count++;
        return count;
    }

    private async Task<int> CountScopesAsync()
    {
        var count = 0;
        await foreach (var _ in _scopeManager.ListAsync()) count++;
        return count;
    }

    private async Task<int> CountTokensAsync()
    {
        var count = 0;
        await foreach (var _ in _tokenManager.ListAsync()) count++;
        return count;
    }

    private async Task<int> CountAuthorizationsAsync()
    {
        var count = 0;
        await foreach (var _ in _authorizationManager.ListAsync()) count++;
        return count;
    }
    #endregion

    #region Client Management
    [HttpGet("clients")]
    public async Task<IActionResult> Clients(int page = 1, int pageSize = 10)
    {
        var clients = new List<ClientViewModel>();
        var count = 0;

        await foreach (var client in _applicationManager.ListAsync())
        {
            count++;
            if (count <= (page - 1) * pageSize) continue;
            if (count > page * pageSize) break;

            clients.Add(new ClientViewModel
            {
                Id = await _applicationManager.GetIdAsync(client),
                ClientId = await _applicationManager.GetClientIdAsync(client),
                DisplayName = await _applicationManager.GetDisplayNameAsync(client),
                ClientType = await _applicationManager.GetClientTypeAsync(client),
                ConsentType = await _applicationManager.GetConsentTypeAsync(client)
            });
        }

        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;
        ViewBag.TotalCount = count;

        return View(clients);
    }

    [HttpGet("clients/create")]
    public async Task<IActionResult> CreateClient()
    {
        var model = new CreateClientViewModel
        {
            AvailableGrantTypes = GetAvailableGrantTypes(),
            AvailablePermissions = await GetAvailablePermissions(),
            AvailableConsentTypes = new List<string>
            {
                OpenIddictConstants.ConsentTypes.Explicit,
                OpenIddictConstants.ConsentTypes.Implicit,
                OpenIddictConstants.ConsentTypes.External,
                OpenIddictConstants.ConsentTypes.Systematic
            }
        };
        return View(model);
    }

    //[HttpPost("clients/create")]
    //
    //public async Task<IActionResult> CreateClient(CreateClientViewModel model)
    //{
    //    if (!ModelState.IsValid)
    //    {
    //        model.AvailableGrantTypes = GetAvailableGrantTypes();
    //        model.AvailablePermissions = GetAvailablePermissions();
    //        return View(model);
    //    }

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

    //        foreach (var permission in model.Permissions)
    //        {
    //            descriptor.Permissions.Add(permission);
    //        }

    //        await _applicationManager.CreateAsync(descriptor);
    //        return RedirectToAction(nameof(Clients));
    //    }
    //    catch (Exception ex)
    //    {
    //        _logger.LogError(ex, "Error creating client");
    //        ModelState.AddModelError("", "An error occurred while creating the client");
    //        model.AvailableGrantTypes = GetAvailableGrantTypes();
    //        model.AvailablePermissions = GetAvailablePermissions();
    //        return View(model);
    //    }
    //}

    [HttpPost("clients/create")]

    public async Task<IActionResult> CreateClient(CreateClientViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailablePermissions = await GetAvailablePermissions();
            model.AvailableGrantTypes = GetAvailableGrantTypes();
            model.AvailableConsentTypes = GetAvailableConsentTypes();
            return View(model);
        }

        try
        {
            var descriptor = new OpenIddictApplicationDescriptor
            {
                ClientId = model.ClientId,
                ClientSecret = model.ClientSecret,
                DisplayName = model.DisplayName,
                ClientType = model.ClientType,
                ConsentType = model.ConsentType
            };

            // Handle redirect URIs with null check
            if (!string.IsNullOrWhiteSpace(model.RedirectUris))
            {
                foreach (var uri in model.RedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Where(uri => !string.IsNullOrWhiteSpace(uri)))
                {
                    descriptor.RedirectUris.Add(new Uri(uri.Trim()));
                }
            }

            // Handle post-logout redirect URIs with null check
            if (!string.IsNullOrWhiteSpace(model.PostLogoutRedirectUris))
            {
                foreach (var uri in model.PostLogoutRedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Where(uri => !string.IsNullOrWhiteSpace(uri)))
                {
                    descriptor.PostLogoutRedirectUris.Add(new Uri(uri.Trim()));
                }
            }

            // Handle permissions with null check
            if (model.Permissions != null)
            {
                foreach (var permission in model.Permissions.Where(p => !string.IsNullOrWhiteSpace(p)))
                {
                    descriptor.Permissions.Add(permission);
                }
            }

            await _applicationManager.CreateAsync(descriptor);
            return RedirectToAction(nameof(Clients));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating client");
            ModelState.AddModelError("", "An error occurred while creating the client");
            model.AvailablePermissions = await GetAvailablePermissions() ?? new List<string>();
            model.AvailableGrantTypes = GetAvailableGrantTypes() ?? new List<string>();
            model.AvailableConsentTypes = GetAvailableConsentTypes() ?? new List<string>();
            return View(model);
        }
    }


    private List<string> GetAvailableConsentTypes()
    {
        return new List<string>
        {
            OpenIddictConstants.ConsentTypes.Explicit,
            OpenIddictConstants.ConsentTypes.Implicit,
            OpenIddictConstants.ConsentTypes.External,
            OpenIddictConstants.ConsentTypes.Systematic
        };
    }

    [HttpGet("clients/edit/{id}")]
    public async Task<IActionResult> EditClient(string id)
    {
        var client = await _applicationManager.FindByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        var clientType = await _applicationManager.GetClientTypeAsync(client);

        var model = new EditClientViewModel
        {
            Id = id,
            ClientId = await _applicationManager.GetClientIdAsync(client),
            DisplayName = await _applicationManager.GetDisplayNameAsync(client),
            ClientType = clientType,
            ConsentType = await _applicationManager.GetConsentTypeAsync(client),
            RedirectUris = string.Join("\n", await _applicationManager.GetRedirectUrisAsync(client)),
            PostLogoutRedirectUris = string.Join("\n",
                await _applicationManager.GetPostLogoutRedirectUrisAsync(client)),
            Permissions = (await _applicationManager.GetPermissionsAsync(client)).ToList(),
            AvailableGrantTypes = GetAvailableGrantTypes(),
            AvailablePermissions = await GetAvailablePermissions(),
            AvailableConsentTypes = GetAvailableConsentTypes(),
            IsConfidential = clientType == OpenIddictConstants.ClientTypes.Confidential
        };

        return View(model);
    }

    [HttpGet("applications/details/{id}")]
    public async Task<IActionResult> ApplicationDetails(string id)
    {
        var application = await _applicationManager.FindByIdAsync(id);
        if (application == null)
        {
            return NotFound();
        }

        var model = new ApplicationDetailViewModel
        {
            Id = id,
            ClientId = await _applicationManager.GetClientIdAsync(application),
            DisplayName = await _applicationManager.GetDisplayNameAsync(application),
            //ClientSecret = await _applicationManager.GetClientSecretAsync(application),
            ClientType = await _applicationManager.GetClientTypeAsync(application),
            ConsentType = await _applicationManager.GetConsentTypeAsync(application),
            RedirectUris = string.Join("\n", await _applicationManager.GetRedirectUrisAsync(application)),
            PostLogoutRedirectUris = string.Join("\n",
                await _applicationManager.GetPostLogoutRedirectUrisAsync(application)),
            Permissions = (await _applicationManager.GetPermissionsAsync(application)).ToList(),
            Requirements = (await _applicationManager.GetRequirementsAsync(application)).ToList(),
            // CreationDate = await _applicationManager.GetCreationDateAsync(application),
            //Scopes = (await _applicationManager.GetScopesAsync(application)).ToList()
        };

        // Extract grant types from permissions
        model.GrantTypes = model.Permissions
            .Where(p => p.StartsWith(OpenIddictConstants.Permissions.Prefixes.GrantType))
            .Select(p => p[OpenIddictConstants.Permissions.Prefixes.GrantType.Length..])
            .ToList();

        return View(model);
    }


    [HttpPost("clients/edit/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditClient(string id, EditClientViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailableGrantTypes = GetAvailableGrantTypes();
            model.AvailablePermissions = await GetAvailablePermissions();
            model.AvailableConsentTypes = GetAvailableConsentTypes();
            return View(model);
        }

        try
        {
            var client = await _applicationManager.FindByIdAsync(id);
            if (client == null)
            {
                return NotFound();
            }

            var clientType = await _applicationManager.GetClientTypeAsync(client);
            var isConfidential = clientType == OpenIddictConstants.ClientTypes.Confidential;

            // Only validate secret if it's a confidential client and the secret field isn't empty
            if (isConfidential && !string.IsNullOrWhiteSpace(model.ClientSecret))
            {
                if (string.IsNullOrWhiteSpace(model.ClientSecret))
                {
                    ModelState.AddModelError("ClientSecret", "Client secret is required for confidential applications.");
                    model.AvailableGrantTypes = GetAvailableGrantTypes();
                    model.AvailablePermissions = await GetAvailablePermissions();
                    model.AvailableConsentTypes = GetAvailableConsentTypes();
                    return View(model);
                }
            }

            var descriptor = new OpenIddictApplicationDescriptor
            {
                ClientId = model.ClientId,
                DisplayName = model.DisplayName,
                ClientType = model.ClientType,
                ConsentType = model.ConsentType
            };

            // Only update secret if provided
            if (!string.IsNullOrWhiteSpace(model.ClientSecret))
            {
                descriptor.ClientSecret = model.ClientSecret;
            }

            if (!string.IsNullOrWhiteSpace(model.RedirectUris))
            {
                foreach (var uri in model.RedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Where(uri => !string.IsNullOrWhiteSpace(uri)))
                {
                    descriptor.RedirectUris.Add(new Uri(uri.Trim()));
                }
            }

            if (!string.IsNullOrWhiteSpace(model.PostLogoutRedirectUris))
            {
                foreach (var uri in model.PostLogoutRedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                    .Where(uri => !string.IsNullOrWhiteSpace(uri)))
                {
                    descriptor.PostLogoutRedirectUris.Add(new Uri(uri.Trim()));
                }
            }

            if (model.Permissions != null)
            {
                foreach (var permission in model.Permissions.Where(p => !string.IsNullOrWhiteSpace(p)))
                {
                    descriptor.Permissions.Add(permission);
                }
            }

            await _applicationManager.UpdateAsync(client, descriptor);
            return RedirectToAction(nameof(Clients));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating client {id}");
            ModelState.AddModelError("", "An error occurred while updating the client");
            model.AvailableGrantTypes = GetAvailableGrantTypes();
            model.AvailablePermissions = await GetAvailablePermissions();
            model.AvailableConsentTypes = GetAvailableConsentTypes();
            return View(model);
        }
    }

    #endregion


    #region Client Management - Missing Actions
    [HttpGet("clients/delete/{id}")]
    public async Task<IActionResult> DeleteClient(string id)
    {
        var client = await _applicationManager.FindByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        var model = new ClientViewModel
        {
            Id = id,
            ClientId = await _applicationManager.GetClientIdAsync(client),
            DisplayName = await _applicationManager.GetDisplayNameAsync(client)
        };

        return View(model);
    }

    [HttpPost("clients/delete/{id}")]

    public async Task<IActionResult> DeleteClientConfirmed(string id)
    {
        var client = await _applicationManager.FindByIdAsync(id);
        if (client == null)
        {
            return NotFound();
        }

        await _applicationManager.DeleteAsync(client);
        return RedirectToAction(nameof(Clients));
    }

    #endregion

    #region API Resource Management - Missing Actions
    [HttpGet("api-resources/edit/{id}")]
    public async Task<IActionResult> EditApiResource(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        var name = await _scopeManager.GetNameAsync(resource);
        var model = new ApiResourceViewModel
        {
            Id = id,
            Name = name.StartsWith("rs_") ? name[3..] : name,
            DisplayName = await _scopeManager.GetDisplayNameAsync(resource),
            Description = await _scopeManager.GetDescriptionAsync(resource)
        };

        return View(model);
    }

    [HttpPost("api-resources/edit/{id}")]

    public async Task<IActionResult> EditApiResource(string id, ApiResourceViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var resource = await _scopeManager.FindByIdAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            await _scopeManager.UpdateAsync(resource, new OpenIddictScopeDescriptor
            {
                Name = "rs_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { "rs_" + model.Name }
            });

            return RedirectToAction(nameof(ApiResources));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating API resource {id}");
            ModelState.AddModelError("", "An error occurred while updating the API resource");
            return View(model);
        }
    }

    [HttpGet("api-resources/delete/{id}")]
    public async Task<IActionResult> DeleteApiResource(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        var name = await _scopeManager.GetNameAsync(resource);
        var model = new ApiResourceViewModel
        {
            Id = id,
            Name = name.StartsWith("rs_") ? name[3..] : name,
            DisplayName = await _scopeManager.GetDisplayNameAsync(resource)
        };

        return View(model);
    }

    [HttpPost("api-resources/delete/{id}")]

    public async Task<IActionResult> DeleteApiResourceConfirmed(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        await _scopeManager.DeleteAsync(resource);
        return RedirectToAction(nameof(ApiResources));
    }
    #endregion
    #region API Resource Management
    [HttpGet("api-resources")]
    public async Task<IActionResult> ApiResources(int page = 1, int pageSize = 10)
    {
        var resources = new List<ApiResourceViewModel>();
        var count = 0;

        await foreach (var scope in _scopeManager.ListAsync())
        {
            var name = await _scopeManager.GetNameAsync(scope);
            if (!name.StartsWith("rs_")) continue;

            count++;
            if (count <= (page - 1) * pageSize) continue;
            if (count > page * pageSize) break;

            resources.Add(new ApiResourceViewModel
            {
                Id = await _scopeManager.GetIdAsync(scope),
                Name = name,
                DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
                Description = await _scopeManager.GetDescriptionAsync(scope)
            });
        }

        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;
        ViewBag.TotalCount = count;

        return View(resources);
    }

    [HttpGet("api-resources/create")]
    public IActionResult CreateApiResource()
    {
        return View();
    }

    [HttpPost("api-resources/create")]

    public async Task<IActionResult> CreateApiResource(ApiResourceViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "rs_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { "rs_" + model.Name }
            };

            await _scopeManager.CreateAsync(descriptor);
            return RedirectToAction(nameof(ApiResources));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating API resource");
            ModelState.AddModelError("", "An error occurred while creating the API resource");
            return View(model);
        }
    }
    #endregion

    #region Identity Resource Management
    //[HttpGet("identity-resources")]
    //public async Task<IActionResult> IdentityResources(int page = 1, int pageSize = 10)
    //{
    //    var resources = new List<IdentityResourceViewModel>();
    //    var count = 0;

    //    await foreach (var scope in _scopeManager.ListAsync())
    //    {
    //        var name = await _scopeManager.GetNameAsync(scope);
    //        if (name.StartsWith("rs_")) continue;

    //        count++;
    //        if (count <= (page - 1) * pageSize) continue;
    //        if (count > page * pageSize) break;

    //        resources.Add(new IdentityResourceViewModel
    //        {
    //            Id = await _scopeManager.GetIdAsync(scope),
    //            Name = name,
    //            DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
    //            Description = await _scopeManager.GetDescriptionAsync(scope)
    //        });
    //    }

    //    ViewBag.Page = page;
    //    ViewBag.PageSize = pageSize;
    //    ViewBag.TotalCount = count;

    //    return View(resources);
    //}


    #endregion

    #region API Scopes Management
    //[HttpGet("api-scopes")]
    //public async Task<IActionResult> ApiScopes(int page = 1, int pageSize = 10)
    //{
    //    var scopes = new List<ApiScopeViewModel>();
    //    var count = 0;

    //    await foreach (var scope in _scopeManager.ListAsync())
    //    {
    //        var name = await _scopeManager.GetNameAsync(scope);
    //        if (!name.StartsWith("api_")) continue;

    //        count++;
    //        if (count <= (page - 1) * pageSize) continue;
    //        if (count > page * pageSize) break;

    //        scopes.Add(new ApiScopeViewModel
    //        {
    //            Id = await _scopeManager.GetIdAsync(scope),
    //            Name = name,
    //            DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
    //            Description = await _scopeManager.GetDescriptionAsync(scope)
    //        });
    //    }

    //    ViewBag.Page = page;
    //    ViewBag.PageSize = pageSize;
    //    ViewBag.TotalCount = count;

    //    return View(scopes);
    //}

    //[HttpGet("api-scopes/create")]
    //public IActionResult CreateApiScope()
    //{
    //    return View();
    //}

    //[HttpPost("api-scopes/create")]

    //public async Task<IActionResult> CreateApiScope(ApiScopeViewModel model)
    //{
    //    if (!ModelState.IsValid)
    //    {
    //        return View(model);
    //    }

    //    try
    //    {
    //        var descriptor = new OpenIddictScopeDescriptor
    //        {
    //            Name = "api_" + model.Name,
    //            DisplayName = model.DisplayName,
    //            Description = model.Description
    //        };

    //        await _scopeManager.CreateAsync(descriptor);
    //        return RedirectToAction(nameof(ApiScopes));
    //    }
    //    catch (Exception ex)
    //    {
    //        _logger.LogError(ex, "Error creating API scope");
    //        ModelState.AddModelError("", "An error occurred while creating the API scope");
    //        return View(model);
    //    }
    //}
    #endregion

    #region Grants Management
    #region Grants (Authorizations) Management

    [HttpGet("grants")]
    public async Task<IActionResult> Grants(int page = 1, int pageSize = 10, string search = null)
    {
        var grants = new List<GrantViewModel>();
        var count = 0;

        await foreach (var authorization in _authorizationManager.ListAsync())
        {
            var subject = await _authorizationManager.GetSubjectAsync(authorization);
            var applicationId = await _authorizationManager.GetApplicationIdAsync(authorization);
            var application = applicationId != null ? await _applicationManager.FindByIdAsync(applicationId) : null;

            //// Apply search filter
            //if (!string.IsNullOrEmpty(search) &&
            //    !subject.Contains(search, StringComparison.OrdinalIgnoreCase) &&
            //    (application == null || !await _applicationManager.GetDisplayNameAsync(application).Contains(search, StringComparison.OrdinalIgnoreCase)))
            //{
            //    continue;
            //}

            count++;
            if (count <= (page - 1) * pageSize) continue;
            if (count > page * pageSize) break;

            grants.Add(new GrantViewModel
            {
                Id = await _authorizationManager.GetIdAsync(authorization),
                Subject = subject,
                ApplicationName = application != null ? await _applicationManager.GetDisplayNameAsync(application) : null,
                CreationDate = await _authorizationManager.GetCreationDateAsync(authorization),
                Status = await _authorizationManager.GetStatusAsync(authorization),
                Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList()
            });
        }

        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;
        ViewBag.TotalCount = count;
        ViewBag.Search = search;

        return View(grants);
    }

    [HttpGet("grants/edit/{id}")]
    public async Task<IActionResult> EditGrant(string id)
    {
        var authorization = await _authorizationManager.FindByIdAsync(id);
        if (authorization == null)
        {
            return NotFound();
        }

        var applicationId = await _authorizationManager.GetApplicationIdAsync(authorization);
        var application = applicationId != null ? await _applicationManager.FindByIdAsync(applicationId) : null;

        var model = new EditGrantViewModel
        {
            Id = id,
            Subject = await _authorizationManager.GetSubjectAsync(authorization),
            ApplicationName = application != null ? await _applicationManager.GetDisplayNameAsync(application) : null,
            CreationDate = await _authorizationManager.GetCreationDateAsync(authorization),
            Status = await _authorizationManager.GetStatusAsync(authorization),
            Scopes = (await _authorizationManager.GetScopesAsync(authorization)).ToList(),
            AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        }
        };

        return View(model);
    }
    [HttpGet("grants/create")]
    public async Task<IActionResult> CreateGrant()
    {
        var model = new CreateGrantViewModel
        {
            AvailableApplications = await GetApplicationList(),
            AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        },
            AvailableScopes = await GetScopeList()
        };

        return View(model);
    }

    [HttpPost("grants/create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateGrant(CreateGrantViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailableApplications = await GetApplicationList();
            model.AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        };
            model.AvailableScopes = await GetScopeList();
            return View(model);
        }

        try
        {
            var descriptor = new OpenIddictAuthorizationDescriptor
            {
                Subject = model.Subject,
                Status = model.Status,
                // Scopes = { model.Scopes },
                Type = OpenIddictConstants.AuthorizationTypes.Permanent
            };

            if (!string.IsNullOrEmpty(model.ApplicationId))
            {
                descriptor.ApplicationId = model.ApplicationId;
            }

            await _authorizationManager.CreateAsync(descriptor);
            return RedirectToAction(nameof(Grants));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating grant");
            ModelState.AddModelError("", "An error occurred while creating the grant");
            model.AvailableApplications = await GetApplicationList();
            model.AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        };
            model.AvailableScopes = await GetScopeList();
            return View(model);
        }
    }
    private async Task<List<SelectListItem>> GetApplicationList()
    {
        var applications = new List<SelectListItem>();
        await foreach (var application in _applicationManager.ListAsync())
        {
            applications.Add(new SelectListItem
            {
                Value = await _applicationManager.GetIdAsync(application),
                Text = await _applicationManager.GetDisplayNameAsync(application)
            });
        }
        return applications;
    }

    private async Task<List<string>> GetScopeList()
    {
        var scopes = new List<string>();
        await foreach (var scope in _scopeManager.ListAsync())
        {
            scopes.Add(await _scopeManager.GetNameAsync(scope));
        }
        return scopes;
    }
    [HttpPost("grants/edit/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditGrant(string id, EditGrantViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        };
            return View(model);
        }

        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(id);
            if (authorization == null)
            {
                return NotFound();
            }

            await _authorizationManager.UpdateAsync(authorization, new OpenIddictAuthorizationDescriptor
            {
                Status = model.Status
            });

            return RedirectToAction(nameof(Grants));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating grant {id}");
            ModelState.AddModelError("", "An error occurred while updating the grant");
            model.AvailableStatuses = new List<string>
        {
            OpenIddictConstants.Statuses.Valid,
            OpenIddictConstants.Statuses.Revoked
        };
            return View(model);
        }
    }

    [HttpGet("grants/delete/{id}")]
    public async Task<IActionResult> DeleteGrant(string id)
    {
        var authorization = await _authorizationManager.FindByIdAsync(id);
        if (authorization == null)
        {
            return NotFound();
        }

        var applicationId = await _authorizationManager.GetApplicationIdAsync(authorization);
        var application = applicationId != null ? await _applicationManager.FindByIdAsync(applicationId) : null;

        var model = new GrantViewModel
        {
            Id = id,
            Subject = await _authorizationManager.GetSubjectAsync(authorization),
            ApplicationName = application != null ? await _applicationManager.GetDisplayNameAsync(application) : null,
            CreationDate = await _authorizationManager.GetCreationDateAsync(authorization)
        };

        return View(model);
    }

    [HttpPost("grants/delete/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteGrantConfirmed(string id)
    {
        var authorization = await _authorizationManager.FindByIdAsync(id);
        if (authorization == null)
        {
            return NotFound();
        }

        await _authorizationManager.DeleteAsync(authorization);
        return RedirectToAction(nameof(Grants));
    }

    #endregion

    [HttpPost("grants/revoke")]

    public async Task<IActionResult> RevokeGrant(string id)
    {
        try
        {
            var authorization = await _authorizationManager.FindByIdAsync(id);
            if (authorization == null)
            {
                return NotFound();
            }

            await _authorizationManager.DeleteAsync(authorization);
            return RedirectToAction(nameof(Grants));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error revoking grant {id}");
            return StatusCode(500, "An error occurred while revoking the grant");
        }
    }
    #endregion

    #region Helper Methods
    private async  Task<List<string>> GetAvailablePermissions()
    {
        //var scopes =  _scopeManager.ListAsync();
        var scopes = new List<string>();
        await foreach (var scope in _scopeManager.ListAsync())
        {
            scopes.Add(await _scopeManager.GetNameAsync(scope));
        }
        var x= new List<string>
        {
            OpenIddictConstants.Permissions.Endpoints.Authorization,
            OpenIddictConstants.Permissions.Endpoints.Token,
            OpenIddictConstants.Permissions.Endpoints.DeviceAuthorization,
            //OpenIddictConstants.Permissions.Endpoints.Logout,
           // OpenIddictConstants.Permissions.Endpoints.Userinfo,
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
        x.AddRange(scopes);
        return x;
    }

    private List<string> GetAvailableGrantTypes()
    {
        return new List<string>
        {
            OpenIddictConstants.ClientTypes.Public,
            OpenIddictConstants.ClientTypes.Confidential
        };
    }
    #endregion

    #region Applications Actions
    [HttpGet("applications")]
    public async Task<IActionResult> Applications(int page = 1, int pageSize = 10, string search = null)
    {
        try
        {
            var applications = new List<ApplicationViewModel>();
            var count = 0;

            await foreach (var application in _applicationManager.ListAsync())
            {
                var clientId = await _applicationManager.GetClientIdAsync(application);
                var displayName = await _applicationManager.GetDisplayNameAsync(application);

                // Apply search filter if provided
                if (!string.IsNullOrEmpty(search) &&
                    !clientId.Contains(search, StringComparison.OrdinalIgnoreCase) &&
                    !displayName.Contains(search, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                count++;
                if (count <= (page - 1) * pageSize) continue;
                if (count > page * pageSize) break;

                applications.Add(new ApplicationViewModel
                {
                    Id = await _applicationManager.GetIdAsync(application),
                    ClientId = clientId,
                    DisplayName = displayName,
                    ClientType = await _applicationManager.GetClientTypeAsync(application),
                    ConsentType = await _applicationManager.GetConsentTypeAsync(application)
                });
            }

            ViewBag.Page = page;
            ViewBag.PageSize = pageSize;
            ViewBag.TotalCount = count;
            ViewBag.Search = search;

            return View(applications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving applications");
            return StatusCode(500, "An error occurred while retrieving applications");
        }
    }

    //[HttpGet("applications/create")]
    //public IActionResult CreateApplication()
    //{
    //    var model = new CreateApplicationViewModel
    //    {
    //        AvailablePermissions = GetAvailablePermissions(),
    //        AvailableGrantTypes = GetAvailableGrantTypes(),
    //        AvailableConsentTypes = new List<string>
    //    {
    //        OpenIddictConstants.ConsentTypes.Explicit,
    //        OpenIddictConstants.ConsentTypes.Implicit,
    //        OpenIddictConstants.ConsentTypes.External,
    //        OpenIddictConstants.ConsentTypes.Systematic
    //    }
    //    };
    //    return View(model);
    //}

    //[HttpPost("applications/create")]

    //public async Task<IActionResult> CreateApplication(CreateApplicationViewModel model)
    //{
    //    if (!ModelState.IsValid)
    //    {
    //        model.AvailablePermissions = GetAvailablePermissions();
    //        model.AvailableGrantTypes = GetAvailableGrantTypes();
    //        return View(model);
    //    }

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

    //        if (!string.IsNullOrEmpty(model.RedirectUris))
    //        {
    //            foreach (var uri in model.RedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries))
    //            {
    //                descriptor.RedirectUris.Add(new Uri(uri.Trim()));
    //            }
    //        }

    //        if (!string.IsNullOrEmpty(model.PostLogoutRedirectUris))
    //        {
    //            foreach (var uri in model.PostLogoutRedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries))
    //            {
    //                descriptor.PostLogoutRedirectUris.Add(new Uri(uri.Trim()));
    //            }
    //        }

    //        foreach (var permission in model.Permissions)
    //        {
    //            descriptor.Permissions.Add(permission);
    //        }

    //        await _applicationManager.CreateAsync(descriptor);
    //        return RedirectToAction(nameof(Applications));
    //    }
    //    catch (Exception ex)
    //    {
    //        _logger.LogError(ex, "Error creating application");
    //        ModelState.AddModelError("", "An error occurred while creating the application");
    //        model.AvailablePermissions = GetAvailablePermissions();
    //        model.AvailableGrantTypes = GetAvailableGrantTypes();
    //        return View(model);
    //    }
    //}

    [HttpGet("applications/edit/{id}")]
    public async Task<IActionResult> EditApplication(string id)
    {
        var application = await _applicationManager.FindByIdAsync(id);
        if (application == null)
        {
            return NotFound();
        }

        var model = new EditApplicationViewModel
        {
            Id = id,
            ClientId = await _applicationManager.GetClientIdAsync(application),
            DisplayName = await _applicationManager.GetDisplayNameAsync(application),
            ClientType = await _applicationManager.GetClientTypeAsync(application),
            ConsentType = await _applicationManager.GetConsentTypeAsync(application),
            RedirectUris = string.Join("\n", await _applicationManager.GetRedirectUrisAsync(application)),
            PostLogoutRedirectUris = string.Join("\n",
                await _applicationManager.GetPostLogoutRedirectUrisAsync(application)),
            Permissions = (await _applicationManager.GetPermissionsAsync(application)).ToList(),
            AvailablePermissions = await GetAvailablePermissions(),
            AvailableGrantTypes = GetAvailableGrantTypes(),
            AvailableConsentTypes = new List<string>
        {
            OpenIddictConstants.ConsentTypes.Explicit,
            OpenIddictConstants.ConsentTypes.Implicit,
            OpenIddictConstants.ConsentTypes.External,
            OpenIddictConstants.ConsentTypes.Systematic
        }
        };

        return View(model);
    }

    [HttpPost("applications/edit/{id}")]

    public async Task<IActionResult> EditApplication(string id, EditApplicationViewModel model)
    {
        if (!ModelState.IsValid)
        {
            model.AvailablePermissions = await GetAvailablePermissions();
            model.AvailableGrantTypes = GetAvailableGrantTypes();
            return View(model);
        }

        try
        {
            var application = await _applicationManager.FindByIdAsync(id);
            if (application == null)
            {
                return NotFound();
            }

            await _applicationManager.UpdateAsync(application, new OpenIddictApplicationDescriptor
            {
                ClientId = model.ClientId,
                DisplayName = model.DisplayName,
                ClientType = model.ClientType,
                ConsentType = model.ConsentType,
                //RedirectUris = { model.RedirectUris.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                //.Select(uri => new Uri(uri.Trim())) },
                //PostLogoutRedirectUris = { model.PostLogoutRedirectUris.Split('\n',
                //StringSplitOptions.RemoveEmptyEntries).Select(uri => new Uri(uri.Trim())) },
                //Permissions = { model.Permissions }
            });

            return RedirectToAction(nameof(Applications));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating application {id}");
            ModelState.AddModelError("", "An error occurred while updating the application");
            model.AvailablePermissions = await GetAvailablePermissions();
            model.AvailableGrantTypes = GetAvailableGrantTypes();   
            return View(model);
        }
    }

    [HttpGet("applications/delete/{id}")]
    public async Task<IActionResult> DeleteApplication(string id)
    {
        var application = await _applicationManager.FindByIdAsync(id);
        if (application == null)
        {
            return NotFound();
        }

        var model = new ApplicationViewModel
        {
            Id = id,
            ClientId = await _applicationManager.GetClientIdAsync(application),
            DisplayName = await _applicationManager.GetDisplayNameAsync(application)
        };

        return View(model);
    }

    [HttpPost("applications/delete/{id}")]

    public async Task<IActionResult> DeleteApplicationConfirmed(string id)
    {
        var application = await _applicationManager.FindByIdAsync(id);
        if (application == null)
        {
            return NotFound();
        }

        await _applicationManager.DeleteAsync(application);
        return RedirectToAction(nameof(Applications));
    }
    #endregion

    #region Identity Resources Actions

    [HttpGet("identity-resources")]
    public async Task<IActionResult> IdentityResources(int page = 1, int pageSize = 10, string search = null)
    {
        var resources = new List<IdentityResourceViewModel>();
        var count = 0;

        await foreach (var scope in _scopeManager.ListAsync())
        {
            var name = await _scopeManager.GetNameAsync(scope);
            // Skip API resources and scopes
            if (name.StartsWith("rs_") || name.StartsWith("api_")) continue;

            var displayName = await _scopeManager.GetDisplayNameAsync(scope);

            // Apply search filter
            if (!string.IsNullOrEmpty(search) &&
                !name.Contains(search, StringComparison.OrdinalIgnoreCase) &&
                !displayName.Contains(search, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            count++;
            if (count <= (page - 1) * pageSize) continue;
            if (count > page * pageSize) break;

            resources.Add(new IdentityResourceViewModel
            {
                Id = await _scopeManager.GetIdAsync(scope),
                Name = name,
                DisplayName = displayName,
                Description = await _scopeManager.GetDescriptionAsync(scope)
            });
        }

        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;
        ViewBag.TotalCount = count;
        ViewBag.Search = search;

        return View(resources);
    }

    [HttpGet("identity-resources/create")]
    public IActionResult CreateIdentityResource()
    {
        return View();
    }

    [HttpPost("identity-resources/create")]

    public async Task<IActionResult> CreateIdentityResource(IdentityResourceViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { model.Name } // Important for identity resources
            };

            await _scopeManager.CreateAsync(descriptor);
            return RedirectToAction(nameof(IdentityResources));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating identity resource");
            ModelState.AddModelError("", "An error occurred while creating the identity resource");
            return View(model);
        }
    }

    [HttpGet("identity-resources/edit/{id}")]
    public async Task<IActionResult> EditIdentityResource(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        var model = new IdentityResourceViewModel
        {
            Id = id,
            Name = await _scopeManager.GetNameAsync(resource),
            DisplayName = await _scopeManager.GetDisplayNameAsync(resource),
            Description = await _scopeManager.GetDescriptionAsync(resource)
        };

        return View(model);
    }

    [HttpPost("identity-resources/edit/{id}")]

    public async Task<IActionResult> EditIdentityResource(string id, IdentityResourceViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var resource = await _scopeManager.FindByIdAsync(id);
            if (resource == null)
            {
                return NotFound();
            }

            await _scopeManager.UpdateAsync(resource, new OpenIddictScopeDescriptor
            {
                Name = model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { model.Name }
            });

            return RedirectToAction(nameof(IdentityResources));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating identity resource {id}");
            ModelState.AddModelError("", "An error occurred while updating the identity resource");
            return View(model);
        }
    }

    [HttpGet("identity-resources/delete/{id}")]
    public async Task<IActionResult> DeleteIdentityResource(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        var model = new IdentityResourceViewModel
        {
            Id = id,
            Name = await _scopeManager.GetNameAsync(resource),
            DisplayName = await _scopeManager.GetDisplayNameAsync(resource)
        };

        return View(model);
    }

    [HttpPost("identity-resources/delete/{id}")]

    public async Task<IActionResult> DeleteIdentityResourceConfirmed(string id)
    {
        var resource = await _scopeManager.FindByIdAsync(id);
        if (resource == null)
        {
            return NotFound();
        }

        await _scopeManager.DeleteAsync(resource);
        return RedirectToAction(nameof(IdentityResources));
    }

    #endregion

    #region API Scopes Actions

    [HttpGet("api-scopes")]
    public async Task<IActionResult> ApiScopes(int page = 1, int pageSize = 10, string search = null)
    {
        var scopes = new List<ApiScopeViewModel>();
        var count = 0;

        await foreach (var scope in _scopeManager.ListAsync())
        {
            var name = await _scopeManager.GetNameAsync(scope);
            // Filter for API scopes (prefixed with "api_")
            if (!name.StartsWith("api_")) continue;

            var displayName = await _scopeManager.GetDisplayNameAsync(scope);

            // Apply search filter
            if (!string.IsNullOrEmpty(search) &&
                !name.Contains(search, StringComparison.OrdinalIgnoreCase) &&
                !displayName.Contains(search, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            count++;
            if (count <= (page - 1) * pageSize) continue;
            if (count > page * pageSize) break;

            scopes.Add(new ApiScopeViewModel
            {
                Id = await _scopeManager.GetIdAsync(scope),
                Name = name[4..], // Remove "api_" prefix
                DisplayName = displayName,
                Description = await _scopeManager.GetDescriptionAsync(scope)
            });
        }

        ViewBag.Page = page;
        ViewBag.PageSize = pageSize;
        ViewBag.TotalCount = count;
        ViewBag.Search = search;

        return View(scopes);
    }

    [HttpGet("api-scopes/create")]
    public IActionResult CreateApiScope()
    {
        return View();
    }

    [HttpPost("api-scopes/create")]
    //[ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateApiScope(ApiScopeViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var descriptor = new OpenIddictScopeDescriptor
            {
                Name = "api_" + model.Name, // Add prefix
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { "api_" + model.Name } // Important for API scopes
            };

            await _scopeManager.CreateAsync(descriptor);
            return RedirectToAction(nameof(ApiScopes));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating API scope");
            ModelState.AddModelError("", "An error occurred while creating the API scope");
            return View(model);
        }
    }

    [HttpGet("api-scopes/edit/{id}")]
    public async Task<IActionResult> EditApiScope(string id)
    {
        var scope = await _scopeManager.FindByIdAsync(id);
        if (scope == null)
        {
            return NotFound();
        }

        var name = await _scopeManager.GetNameAsync(scope);
        var model = new ApiScopeViewModel
        {
            Id = id,
            Name = name.StartsWith("api_") ? name[4..] : name,
            DisplayName = await _scopeManager.GetDisplayNameAsync(scope),
            Description = await _scopeManager.GetDescriptionAsync(scope)
        };

        return View(model);
    }

    [HttpPost("api-scopes/edit/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> EditApiScope(string id, ApiScopeViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        try
        {
            var scope = await _scopeManager.FindByIdAsync(id);
            if (scope == null)
            {
                return NotFound();
            }

            await _scopeManager.UpdateAsync(scope, new OpenIddictScopeDescriptor
            {
                Name = "api_" + model.Name,
                DisplayName = model.DisplayName,
                Description = model.Description,
                Resources = { "api_" + model.Name }
            });

            return RedirectToAction(nameof(ApiScopes));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating API scope {id}");
            ModelState.AddModelError("", "An error occurred while updating the API scope");
            return View(model);
        }
    }

    [HttpGet("api-scopes/delete/{id}")]
    public async Task<IActionResult> DeleteApiScope(string id)
    {
        var scope = await _scopeManager.FindByIdAsync(id);
        if (scope == null)
        {
            return NotFound();
        }

        var name = await _scopeManager.GetNameAsync(scope);
        var model = new ApiScopeViewModel
        {
            Id = id,
            Name = name.StartsWith("api_") ? name[4..] : name,
            DisplayName = await _scopeManager.GetDisplayNameAsync(scope)
        };

        return View(model);
    }

    [HttpPost("api-scopes/delete/{id}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteApiScopeConfirmed(string id)
    {
        var scope = await _scopeManager.FindByIdAsync(id);
        if (scope == null)
        {
            return NotFound();
        }

        await _scopeManager.DeleteAsync(scope);
        return RedirectToAction(nameof(ApiScopes));
    }

    #endregion
}