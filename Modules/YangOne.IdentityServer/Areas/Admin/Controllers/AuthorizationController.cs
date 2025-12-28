using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Microsoft.IdentityModel.Tokens;
using OpenIddict.Abstractions;
using OpenIddict.Server.AspNetCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.ActionConstraints;
using Microsoft.AspNetCore.Routing;
using YangOne.Identity.Service;
using YangOne.IdentityServer.Dto;
using YangOne.Log;
using YangOne.Web;
using static OpenIddict.Abstractions.OpenIddictConstants;

using IdentityUser = YangOne.Identity.Model.IdentityUser;
namespace YangOne.IdentityServer.Admin.Controllers;

//public class AuthorizationController : BaseController
//{
//    private readonly IOpenIddictApplicationManager _applicationManager;
//    private readonly IOpenIddictScopeManager _scopeManager;
//    private readonly UserManager<IdentityUser> _userManager;
//    private readonly SignInManager<IdentityUser> _signInManager;

//    private readonly ILoginHistoryService _loginHistoryService;
//    private readonly IUserDeviceService _deviceService;
//    private readonly IAppUserService _appUserService;

//    private readonly ILogger _logger;

//    public AuthorizationController(IOpenIddictApplicationManager applicationManager,
//        IOpenIddictScopeManager scopeManager,
//        UserManager<IdentityUser> userManager,
//        SignInManager<IdentityUser> signInManager,
//        IAppUserService appUserService,
//        ILogger logger,
//        ILoginHistoryService loginHistoryService,
//        IUserDeviceService deviceService
//        )
//    {
//        _applicationManager = applicationManager;
//        _scopeManager = scopeManager;
//        _userManager = userManager;
//        _signInManager = signInManager;
//        _appUserService = appUserService;
//    }

//    //[HttpPost("~/connect/token"), IgnoreAntiforgeryToken, Produces("application/json")]
//    //public async Task<IActionResult> Exchange()
//    //{
//    //    var request = HttpContext.GetOpenIddictServerRequest();
//    //    if (request.IsClientCredentialsGrantType())
//    //    {
//    //        // Note: the client credentials are automatically validated by OpenIddict:
//    //        // if client_id or client_secret are invalid, this action won't be invoked.

//    //        var application = await _applicationManager.FindByClientIdAsync(request.ClientId);
//    //        if (application == null)
//    //        {
//    //            throw new InvalidOperationException("The application details cannot be found in the database.");
//    //        }

//    //        // Create the claims-based identity that will be used by OpenIddict to generate tokens.
//    //        var identity = new ClaimsIdentity(
//    //            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
//    //            nameType: OpenIddictConstants.Claims.Name,
//    //            roleType: OpenIddictConstants.Claims.Role);

//    //        // Add the claims that will be persisted in the tokens (use the client_id as the subject identifier).
//    //        identity.SetClaim(OpenIddictConstants.Claims.Subject, await _applicationManager.GetClientIdAsync(application));
//    //        identity.SetClaim(OpenIddictConstants.Claims.Name, await _applicationManager.GetDisplayNameAsync(application));

//    //        // Note: In the original OAuth 2.0 specification, the client credentials grant
//    //        // doesn't return an identity token, which is an OpenID Connect concept.
//    //        //
//    //        // As a non-standardized extension, OpenIddict allows returning an id_token
//    //        // to convey information about the client application when the "openid" scope
//    //        // is granted (i.e specified when calling principal.SetScopes()). When the "openid"
//    //        // scope is not explicitly set, no identity token is returned to the client application.

//    //        // Set the list of scopes granted to the client application in access_token.
//    //        identity.SetScopes(request.GetScopes());
//    //        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());
//    //        identity.SetDestinations(GetDestinations);

//    //        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//    //    }

//    //    throw new NotImplementedException("The specified grant type is not implemented.");
//    //}




//    [HttpPost("~/connect/token")]
//   // [IgnoreAntiforgeryToken]
//    [Produces("application/json")]
//    public async Task<IActionResult> Exchange()
//    {
//        try
//        {
//            var request = HttpContext.GetOpenIddictServerRequest();
//            if (request == null)
//            {
//                return BadRequest(new { error = "invalid_request", error_description = "Invalid request" });
//            }

//            if (request.IsPasswordGrantType())
//            {
//                return await HandlePasswordGrant(request);
//            }
//            else if (request.IsClientCredentialsGrantType())
//            {
//                return await HandleClientCredentialsGrant(request);
//            }

//            return BadRequest(new { error = "unsupported_grant_type", error_description = "The grant type is not supported" });
//        }
//        catch (Exception ex)
//        {
//            return StatusCode(500, new { error = "server_error", error_description = $"An internal error occurred: {ex.Message}" });
//        }
//    }

//    private async Task<IActionResult> HandlePasswordGrant(OpenIddictRequest request)
//    {
//        // Validate user credentials
//        var user = await _userManager.FindByNameAsync(request.Username);
//        if (user == null)
//        {
//            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
//            {
//                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
//                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid username or password"
//            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//        }

//        // Check password
//        if (!await _userManager.CheckPasswordAsync(user, request.Password))
//        {
//            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
//            {
//                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
//                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid username or password"
//            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//        }

//        // Check if user is locked out
//        if (await _userManager.IsLockedOutAsync(user))
//        {
//            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
//            {
//                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
//                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Account locked out"
//            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//        }

//        // Check if email is confirmed
//        if (!await _userManager.IsEmailConfirmedAsync(user))
//        {
//            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
//            {
//                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
//                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Email not confirmed"
//            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//        }

//        var appUser = await _appUserService.AppUserCrudService.GetAsync("Where IdentityUserId=@UserId", new
//        {
//            UserId = user.Id
//        });
//        // Create the claims-based identity
//        var identity = new ClaimsIdentity(
//            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
//            nameType: OpenIddictConstants.Claims.Name,
//            roleType: OpenIddictConstants.Claims.Role);

//        // Add standard claims
//        identity.SetClaim(OpenIddictConstants.Claims.Subject, user.Id.ToString());
//        identity.SetClaim(OpenIddictConstants.Claims.Name, user.UserName);
//        identity.SetClaim(OpenIddictConstants.Claims.Email, user.Email);

//        // Add custom claims based on your requirements
//        identity.SetClaim("IdUid", user.Id.ToString());
//        identity.SetClaim("username", appUser.Email);
//        identity.SetClaim("email", appUser.Email);
//        identity.SetClaim("name", appUser.FirstName+" "+ appUser.LastName );
//        identity.SetClaim("firstname", appUser.FirstName);
//        identity.SetClaim("surname", appUser.LastName);
//        identity.SetClaim("dob", appUser?.DOB);
//        identity.SetClaim("picture", appUser.ProfilePicture);

//        // Add authentication time
//        identity.SetClaim("auth_time", DateTimeOffset.UtcNow.ToUnixTimeSeconds());

//        // Add authentication method
//        identity.SetClaim("amr", "pwd");

//        // Add roles
//        var roles = await _userManager.GetRolesAsync(user);
//        foreach (var role in roles)
//        {
//            identity.SetClaim("role", role);
//        }


//        // Set scopes
//        identity.SetScopes(request.GetScopes());
//        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());

//        // Set destinations for claims
//        identity.SetDestinations(static claim => claim.Type switch
//        {
//            OpenIddictConstants.Claims.Name or
//            OpenIddictConstants.Claims.Email or
//            OpenIddictConstants.Claims.Role or
//            "firstname" or
//            "surname" or
//            "dob" or
//            "picture" or
//            "OrganizationId" or
//            "EmployeeId" or
//            "use" or
//            "role" or
//            "IdUid" or
//            "username" or
//            "email" or
//            "name"
//                => new[] { OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken },

//            _ => new[] { OpenIddictConstants.Destinations.AccessToken }
//        });

//        // Reset lockout count on successful login
//        await _userManager.ResetAccessFailedCountAsync(user);

//        // Create the authentication ticket
//        var principal = new ClaimsPrincipal(identity);

//        // Set the authentication method
//       // principal.SetAuthenticationMethod("pwd");

//        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//    }

//    private async Task<IActionResult> HandleClientCredentialsGrant(OpenIddictRequest request)
//    {
//        // Note: the client credentials are automatically validated by OpenIddict
//        var application = await _applicationManager.FindByClientIdAsync(request.ClientId);
//        if (application == null)
//        {
//            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
//            {
//                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidClient,
//                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The client application was not found"
//            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//        }

//        // Create the claims-based identity
//        var identity = new ClaimsIdentity(
//            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
//            nameType: OpenIddictConstants.Claims.Name,
//            roleType: OpenIddictConstants.Claims.Role);

//        // Add the claims that will be persisted in the tokens
//        identity.SetClaim(OpenIddictConstants.Claims.Subject, await _applicationManager.GetClientIdAsync(application));
//        identity.SetClaim(OpenIddictConstants.Claims.Name, await _applicationManager.GetDisplayNameAsync(application));

//        // Set the list of scopes granted to the client application
//        identity.SetScopes(request.GetScopes());
//        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());

//        // Set destinations for claims
//        identity.SetDestinations(static claim => claim.Type switch
//        {
//            OpenIddictConstants.Claims.Name
//                => new[] { OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken },

//            _ => new[] { OpenIddictConstants.Destinations.AccessToken }
//        });

//        return SignIn(new ClaimsPrincipal(identity), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
//    }

//    [HttpGet("idsrv/create")]
//    public async Task<IActionResult> TestCreate()
//    {


//        // Create a test client if it doesn't exist
//        if (await _applicationManager.FindByClientIdAsync("test-client") is null)
//        {
//            await _applicationManager.CreateAsync(new OpenIddictApplicationDescriptor
//            {
//                ClientId = "test-client",
//                ClientSecret = "test-secret",
//                DisplayName = "Test Client",
//                Permissions =
//                {
//                    Permissions.Endpoints.Token,
//                    Permissions.GrantTypes.ClientCredentials,
//                    Permissions.Scopes.Email,
//                    Permissions.Scopes.Profile,
//                    Permissions.Scopes.Roles,
//                    "api"
//                }
//            });
//        }

//        return Json(true);
//    }

//    private static IEnumerable<string> GetDestinations(Claim claim)
//    {
//        // Note: by default, claims are NOT automatically included in the access and identity tokens.
//        // To allow OpenIddict to serialize them, you must attach them a destination, that specifies
//        // whether they should be included in access tokens, in identity tokens or in both.

//        return claim.Type switch
//        {
//            OpenIddictConstants.Claims.Name or OpenIddictConstants.Claims.Subject => [OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken],

//        _ => [OpenIddictConstants.Destinations.AccessToken],
//        };
//    }
//}

public class AuthorizationController : Controller
{
    private readonly IOpenIddictApplicationManager _applicationManager;
    private readonly IOpenIddictAuthorizationManager _authorizationManager;
    private readonly IOpenIddictScopeManager _scopeManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IAppUserService _appUserService;

    public AuthorizationController(
        IOpenIddictApplicationManager applicationManager,
        IOpenIddictAuthorizationManager authorizationManager,
        IOpenIddictScopeManager scopeManager,
        SignInManager<IdentityUser> signInManager,
        UserManager<IdentityUser> userManager,IAppUserService appUserService)
    {
        _applicationManager = applicationManager;
        _authorizationManager = authorizationManager;
        _scopeManager = scopeManager;
        _signInManager = signInManager;
        _userManager = userManager;
        _appUserService = appUserService;
    }

    //[HttpGet("~/connect/authorize")]
    //[HttpPost("~/connect/authorize")]
    //[IgnoreAntiforgeryToken]
    //public async Task<IActionResult> Authorize()
    //{
    //    var request = HttpContext.GetOpenIddictServerRequest() ??
    //        throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

    //    // If prompt=login was specified by the client application,
    //    // immediately return the user agent to the login page.
    //    if (request.HasPromptValue(PromptValues.Login))
    //    {
    //        // To avoid endless login -> authorization redirects, the prompt=login flag
    //        // is removed from the authorization request payload before redirecting the user.
    //        var prompt = string.Join(" ", request.GetPromptValues().Remove(PromptValues.Login));

    //        var parameters = Request.HasFormContentType ?
    //            Request.Form.Where(parameter => parameter.Key != Parameters.Prompt).ToList() :
    //            Request.Query.Where(parameter => parameter.Key != Parameters.Prompt).ToList();

    //        parameters.Add(KeyValuePair.Create(Parameters.Prompt, new StringValues(prompt)));

    //        return Challenge(
    //            authenticationSchemes: IdentityConstants.ApplicationScheme,
    //            properties: new AuthenticationProperties
    //            {
    //                RedirectUri = Request.PathBase + Request.Path + QueryString.Create(parameters)
    //            });
    //    }

    //    // Retrieve the user principal stored in the authentication cookie.
    //    // If a max_age parameter was provided, ensure that the cookie is not too old.
    //    // If the user principal can't be extracted or the cookie is too old, redirect the user to the login page.
    //    var result = await HttpContext.AuthenticateAsync(IdentityConstants.ApplicationScheme);
    //    if (result == null || !result.Succeeded || (request.MaxAge != null && result.Properties?.IssuedUtc != null &&
    //        DateTimeOffset.UtcNow - result.Properties.IssuedUtc > TimeSpan.FromSeconds(request.MaxAge.Value)))
    //    {
    //        // If the client application requested promptless authentication,
    //        // return an error indicating that the user is not logged in.
    //        if (request.HasPromptValue(PromptValues.None))
    //        {
    //            return Forbid(
    //                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
    //                properties: new AuthenticationProperties(new Dictionary<string, string>
    //                {
    //                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.LoginRequired,
    //                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user is not logged in."
    //                }));
    //        }

    //        return Challenge(
    //            authenticationSchemes: IdentityConstants.ApplicationScheme,
    //            properties: new AuthenticationProperties
    //            {
    //                RedirectUri = Request.PathBase + Request.Path + QueryString.Create(
    //                    Request.HasFormContentType ? Request.Form.ToList() : Request.Query.ToList())
    //            });
    //    }

    //    // Retrieve the profile of the logged in user.
    //    var user = await _userManager.GetUserAsync(result.Principal) ??
    //        throw new InvalidOperationException("The user details cannot be retrieved.");

    //    // Retrieve the application details from the database.
    //    var application = await _applicationManager.FindByClientIdAsync(request.ClientId) ??
    //        throw new InvalidOperationException("Details concerning the calling client application cannot be found.");

    //    // Retrieve the permanent authorizations associated with the user and the calling client application.
    //    var authorizations = await _authorizationManager.FindAsync(
    //        subject: await _userManager.GetUserIdAsync(user),
    //        client: await _applicationManager.GetIdAsync(application),
    //        status: Statuses.Valid,
    //        type: AuthorizationTypes.Permanent,
    //        scopes: request.GetScopes()).ToListAsync();

    //    switch (await _applicationManager.GetConsentTypeAsync(application))
    //    {
    //        // If the consent is external (e.g when authorizations are granted by a sysadmin),
    //        // immediately return an error if no authorization can be found in the database.
    //        case ConsentTypes.External when !authorizations.Any():
    //            return Forbid(
    //                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
    //                properties: new AuthenticationProperties(new Dictionary<string, string>
    //                {
    //                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
    //                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
    //                        "The logged in user is not allowed to access this client application."
    //                }));

    //        // If the consent is implicit or if an authorization was found,
    //        // return an authorization response without displaying the consent form.
    //        case ConsentTypes.Implicit:
    //        case ConsentTypes.External when authorizations.Any():
    //        case ConsentTypes.Explicit when authorizations.Any() && !request.HasPromptValue(PromptValues.Consent):
    //            var principal = await _signInManager.CreateUserPrincipalAsync(user);

    //            // Note: in this sample, the granted scopes match the requested scope
    //            // but you may want to allow the user to uncheck specific scopes.
    //            // For that, simply restrict the list of scopes before calling SetScopes.
    //            principal.SetScopes(request.GetScopes());
    //            principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());

    //            // Automatically create a permanent authorization to avoid requiring explicit consent
    //            // for future authorization or token requests containing the same scopes.
    //            var authorization = authorizations.LastOrDefault();
    //            if (authorization == null)
    //            {
    //                authorization = await _authorizationManager.CreateAsync(
    //                    principal: principal,
    //                    subject: await _userManager.GetUserIdAsync(user),
    //                    client: await _applicationManager.GetIdAsync(application),
    //                    type: AuthorizationTypes.Permanent,
    //                    scopes: principal.GetScopes());
    //            }

    //            principal.SetAuthorizationId(await _authorizationManager.GetIdAsync(authorization));

    //            foreach (var claim in principal.Claims)
    //            {
    //                claim.SetDestinations(GetDestinations(claim, principal));
    //            }

    //            return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

    //        // At this point, no authorization was found in the database and an error must be returned
    //        // if the client application specified prompt=none in the authorization request.
    //        case ConsentTypes.Explicit when request.HasPromptValue(PromptValues.None):
    //        case ConsentTypes.Systematic when request.HasPromptValue(PromptValues.None):
    //            return Forbid(
    //                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
    //                properties: new AuthenticationProperties(new Dictionary<string, string>
    //                {
    //                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
    //                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
    //                        "Interactive user consent is required."
    //                }));

    //        // In every other case, render the consent form.
    //        default:
    //            return View(new AuthorizeViewModel
    //            {
    //                ApplicationName = await _applicationManager.GetDisplayNameAsync(application),
    //                Scope = request.Scope
    //            });
    //    }
    //}


    // GET: /connect/authorize
    [HttpGet("~/connect/authorize")]
    [IgnoreAntiforgeryToken]
    public async Task<IActionResult> Authorize()
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        // prompt=login => force login
        if (request.HasPromptValue(PromptValues.Login))
        {
            var prompt = string.Join(" ", request.GetPromptValues().Remove(PromptValues.Login));

            var parameters = Request.Query
                .Where(p => p.Key != Parameters.Prompt)
                .ToList();

            parameters.Add(KeyValuePair.Create(Parameters.Prompt, new StringValues(prompt)));

            return Challenge(
                authenticationSchemes: IdentityConstants.ApplicationScheme,
                properties: new AuthenticationProperties
                {
                    RedirectUri = Request.PathBase + Request.Path + QueryString.Create(parameters)
                });
        }

        // Read Identity cookie
        var result = await HttpContext.AuthenticateAsync(IdentityConstants.ApplicationScheme);

        var tooOld = request.MaxAge != null
                     && result?.Properties?.IssuedUtc != null
                     && DateTimeOffset.UtcNow - result.Properties.IssuedUtc > TimeSpan.FromSeconds(request.MaxAge.Value);

        if (result == null || !result.Succeeded || tooOld)
        {
            // prompt=none => cannot interact -> return login_required
            if (request.HasPromptValue(PromptValues.None))
            {
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string?>
                    {
                        [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.LoginRequired,
                        [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user is not logged in."
                    }));
            }

            // Otherwise challenge Identity
            return Challenge(
                authenticationSchemes: IdentityConstants.ApplicationScheme,
                properties: new AuthenticationProperties
                {
                    RedirectUri = Request.PathBase + Request.Path + QueryString.Create(Request.Query.ToList())
                });
        }

        var user = await _userManager.GetUserAsync(result.Principal)
            ?? throw new InvalidOperationException("The user details cannot be retrieved.");

        var application = await _applicationManager.FindByClientIdAsync(request.ClientId!)
            ?? throw new InvalidOperationException("Details concerning the calling client application cannot be found.");

        var authorizations = await _authorizationManager.FindAsync(
                subject: await _userManager.GetUserIdAsync(user),
                client: await _applicationManager.GetIdAsync(application),
                status: Statuses.Valid,
                type: AuthorizationTypes.Permanent,
                scopes: request.GetScopes())
            .ToListAsync();

        var consentType = await _applicationManager.GetConsentTypeAsync(application);

        switch (consentType)
        {
            case ConsentTypes.External when !authorizations.Any():
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string?>
                    {
                        [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                        [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                            "The logged in user is not allowed to access this client application."
                    }));

            case ConsentTypes.Implicit:
            case ConsentTypes.External when authorizations.Any():
            case ConsentTypes.Explicit when authorizations.Any() && !request.HasPromptValue(PromptValues.Consent):
                return await IssueAuthorizationResponseAsync(request, user, application, authorizations);

            case ConsentTypes.Explicit when request.HasPromptValue(PromptValues.None):
            case ConsentTypes.Systematic when request.HasPromptValue(PromptValues.None):
                return Forbid(
                    authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                    properties: new AuthenticationProperties(new Dictionary<string, string?>
                    {
                        [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                        [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                            "Interactive user consent is required."
                    }));

            default:
                // Show consent page
                return View(new AuthorizeViewModel
                {
                    ApplicationName = await _applicationManager.GetDisplayNameAsync(application),
                    Scope = request.Scope
                });
        }
    }

    // POST: /connect/authorize  (handles consent decision)
    [Authorize(AuthenticationSchemes = "Identity.Application")]

    [HttpPost("~/connect/authorize")]
    [IgnoreAntiforgeryToken] // keep this unless you add @Html.AntiForgeryToken() and switch to [ValidateAntiForgeryToken]
    public async Task<IActionResult> AuthorizePost()
    {
        var request = HttpContext.GetOpenIddictServerRequest()
            ?? throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        var decision = (string?)Request.Form["submit"];

        // If user denied consent, notify OpenIddict.
        if (string.Equals(decision, "deny", StringComparison.OrdinalIgnoreCase))
        {
            return Forbid(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        // Treat everything else as "accept".
        var user = await _userManager.GetUserAsync(User)
            ?? throw new InvalidOperationException("The user details cannot be retrieved.");

        var application = await _applicationManager.FindByClientIdAsync(request.ClientId!)
            ?? throw new InvalidOperationException("Details concerning the calling client application cannot be found.");

        var authorizations = await _authorizationManager.FindAsync(
                subject: await _userManager.GetUserIdAsync(user),
                client: await _applicationManager.GetIdAsync(application),
                status: Statuses.Valid,
                type: AuthorizationTypes.Permanent,
                scopes: request.GetScopes())
            .ToListAsync();

        // If consent type is External, user cannot self-consent.
        if (!authorizations.Any() && await _applicationManager.HasConsentTypeAsync(application, ConsentTypes.External))
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string?>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
                        "The logged in user is not allowed to access this client application."
                }));
        }

        return await IssueAuthorizationResponseAsync(request, user, application, authorizations);
    }

    private async Task<IActionResult> IssueAuthorizationResponseAsync(
        OpenIddictRequest request,
        IdentityUser user,
        object application,
        List<object> authorizations)
    {
        // Create principal from Identity
        var principal = await _signInManager.CreateUserPrincipalAsync(user);

        principal.SetScopes(request.GetScopes());
        principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());

        // Create or reuse permanent authorization
        var authorization = authorizations.LastOrDefault();
        if (authorization == null)
        {
            authorization = await _authorizationManager.CreateAsync(
                principal: principal,
                subject: await _userManager.GetUserIdAsync(user),
                client: await _applicationManager.GetIdAsync(application),
                type: AuthorizationTypes.Permanent,
                scopes: principal.GetScopes());
        }

        principal.SetAuthorizationId(await _authorizationManager.GetIdAsync(authorization));

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, principal));
        }

        // Ask OpenIddict to issue code/tokens and redirect back to redirect_uri.
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    //private static IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    //{
    //    switch (claim.Type)
    //    {
    //        case Claims.Name:
    //            yield return Destinations.AccessToken;
    //            if (principal.HasScope(Scopes.Profile))
    //                yield return Destinations.IdentityToken;
    //            yield break;

    //        case Claims.Email:
    //            yield return Destinations.AccessToken;
    //            if (principal.HasScope(Scopes.Email))
    //                yield return Destinations.IdentityToken;
    //            yield break;

    //        case Claims.Role:
    //            yield return Destinations.AccessToken;
    //            if (principal.HasScope(Scopes.Roles))
    //                yield return Destinations.IdentityToken;
    //            yield break;

    //        case "AspNet.Identity.SecurityStamp":
    //            yield break;

    //        default:
    //            yield return Destinations.AccessToken;
    //            yield break;
    //    }
    //}

   // [Authorize, FormValueRequired("submit.Accept")]
   // //[Authorize]
   // [HttpPost("~/connect/authorize"), ValidateAntiForgeryToken]
   // public async Task<IActionResult> Accept()
   // {
   //     var request = HttpContext.GetOpenIddictServerRequest() ??
   //         throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

   //     // Retrieve the profile of the logged in user.
   //     var user = await _userManager.GetUserAsync(User) ??
   //         throw new InvalidOperationException("The user details cannot be retrieved.");

   //     // Retrieve the application details from the database.
   //     var application = await _applicationManager.FindByClientIdAsync(request.ClientId) ??
   //         throw new InvalidOperationException("Details concerning the calling client application cannot be found.");

   //     // Retrieve the permanent authorizations associated with the user and the calling client application.
   //     var authorizations = await _authorizationManager.FindAsync(
   //         subject: await _userManager.GetUserIdAsync(user),
   //         client: await _applicationManager.GetIdAsync(application),
   //         status: Statuses.Valid,
   //         type: AuthorizationTypes.Permanent,
   //         scopes: request.GetScopes()).ToListAsync();

   //     // Note: the same check is already made in the other action but is repeated
   //     // here to ensure a malicious user can't abuse this POST-only endpoint and
   //     // force it to return a valid response without the external authorization.
   //     if (!authorizations.Any() && await _applicationManager.HasConsentTypeAsync(application, ConsentTypes.External))
   //     {
   //         return Forbid(
   //             authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
   //             properties: new AuthenticationProperties(new Dictionary<string, string>
   //             {
   //                 [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.ConsentRequired,
   //                 [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] =
   //                     "The logged in user is not allowed to access this client application."
   //             }));
   //     }

   //     var principal = await _signInManager.CreateUserPrincipalAsync(user);

   //     // Note: in this sample, the granted scopes match the requested scope
   //     // but you may want to allow the user to uncheck specific scopes.
   //     // For that, simply restrict the list of scopes before calling SetScopes.
   //     principal.SetScopes(request.GetScopes());
   //     principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());

   //     // Automatically create a permanent authorization to avoid requiring explicit consent
   //     // for future authorization or token requests containing the same scopes.
   //     var authorization = authorizations.LastOrDefault();
   //     if (authorization == null)
   //     {
   //         authorization = await _authorizationManager.CreateAsync(
   //             principal: principal,
   //             subject: await _userManager.GetUserIdAsync(user),
   //             client: await _applicationManager.GetIdAsync(application),
   //             type: AuthorizationTypes.Permanent,
   //             scopes: principal.GetScopes());
   //     }

   //     principal.SetAuthorizationId(await _authorizationManager.GetIdAsync(authorization));

   //     foreach (var claim in principal.Claims)
   //     {
   //         claim.SetDestinations(GetDestinations(claim, principal));
   //     }

   //     // Returning a SignInResult will ask OpenIddict to issue the appropriate access/identity tokens.
   //     return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
   // }

   // [Authorize, FormValueRequired("submit.Deny")]
   //// [Authorize]
   // [HttpPost("~/connect/authorize"), ValidateAntiForgeryToken]
   // // Notify OpenIddict that the authorization grant has been denied by the resource owner
   // // to redirect the user agent to the client application using the appropriate response_mode.
   // public IActionResult Deny() => Forbid(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);

    [HttpGet("~/connect/logout")]
    public IActionResult Logout() => View();

    [ActionName(nameof(Logout)), HttpPost("~/connect/logout"), ValidateAntiForgeryToken]
    public async Task<IActionResult> LogoutPost()
    {
        // Ask ASP.NET Core Identity to delete the local and external cookies created
        // when the user agent is redirected from the external identity provider
        // after a successful authentication flow (e.g Google or Facebook).
        await _signInManager.SignOutAsync();

        // Returning a SignOutResult will ask OpenIddict to redirect the user agent
        // to the post_logout_redirect_uri specified by the client application or to
        // the RedirectUri specified in the authentication properties if none was set.
        return SignOut(
            authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
            properties: new AuthenticationProperties
            {
                RedirectUri = "/"
            });
    }

    [HttpPost("~/connect/token"), Produces("application/json")]
    [AllowAnonymous]
    public async Task<IActionResult> Exchange()
    {
        var request = HttpContext.GetOpenIddictServerRequest() ??
            throw new InvalidOperationException("The OpenID Connect request cannot be retrieved.");

        if (request.IsAuthorizationCodeGrantType() || request.IsRefreshTokenGrantType())
        {
            return await HandleExchangeCodeGrantType();
        }
        if (request.IsPasswordGrantType())
        {
            return await HandlePasswordGrant(request);
        }
        else if (request.IsClientCredentialsGrantType())
        {
            return await HandleExchangeClientCredentialsGrantType(request);
        }

        throw new InvalidOperationException("The specified grant type is not supported.");
    }
    private async Task<IActionResult> HandlePasswordGrant(OpenIddictRequest request)
    {
        // Validate user credentials
        var user = await _userManager.FindByNameAsync(request.Username);
        if (user == null)
        {
            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid username or password"
            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        // Check password
        if (!await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Invalid username or password"
            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        // Check if user is locked out
        if (await _userManager.IsLockedOutAsync(user))
        {
            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Account locked out"
            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        // Check if email is confirmed
        if (!await _userManager.IsEmailConfirmedAsync(user))
        {
            return Forbid(new AuthenticationProperties(new Dictionary<string, string>
            {
                [OpenIddictServerAspNetCoreConstants.Properties.Error] = OpenIddictConstants.Errors.InvalidGrant,
                [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "Email not confirmed"
            }), OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
        }

        var appUser = await _appUserService.AppUserCrudService.GetAsync("Where IdentityUserId=@UserId", new
        {
            UserId = user.Id
        });
        // Create the claims-based identity
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: OpenIddictConstants.Claims.Name,
            roleType: OpenIddictConstants.Claims.Role);

        // Add standard claims
        identity.SetClaim(OpenIddictConstants.Claims.Subject, user.Id.ToString());
        identity.SetClaim(OpenIddictConstants.Claims.Name, user.UserName);
        identity.SetClaim(OpenIddictConstants.Claims.Email, user.Email);

        // Add custom claims based on your requirements
        identity.SetClaim("IdUid", user.Id.ToString());
        identity.SetClaim("username", appUser.Email);
        identity.SetClaim("email", appUser.Email);
        identity.SetClaim("name", appUser.FirstName + " " + appUser.LastName);
        identity.SetClaim("firstname", appUser.FirstName);
        identity.SetClaim("surname", appUser.LastName);
        identity.SetClaim("dob", appUser?.DOB);
        identity.SetClaim("picture", appUser.ProfilePicture);

        // Add authentication time
        identity.SetClaim("auth_time", DateTimeOffset.UtcNow.ToUnixTimeSeconds());

        // Add authentication method
        identity.SetClaim("amr", "pwd");

        // Add roles
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            identity.SetClaim("role", role);
        }


        // Set scopes
        identity.SetScopes(request.GetScopes());
        identity.SetResources(await _scopeManager.ListResourcesAsync(identity.GetScopes()).ToListAsync());

        // Set destinations for claims
        identity.SetDestinations(static claim => claim.Type switch
        {
            OpenIddictConstants.Claims.Name or
            OpenIddictConstants.Claims.Email or
            OpenIddictConstants.Claims.Role or
            "firstname" or
            "surname" or
            "dob" or
            "picture" or
            "OrganizationId" or
            "EmployeeId" or
            "use" or
            "role" or
            "IdUid" or
            "username" or
            "email" or
            "name"
                => new[] { OpenIddictConstants.Destinations.AccessToken, OpenIddictConstants.Destinations.IdentityToken },

            _ => new[] { OpenIddictConstants.Destinations.AccessToken }
        });

        // Reset lockout count on successful login
        await _userManager.ResetAccessFailedCountAsync(user);

        // Create the authentication ticket
        var principal = new ClaimsPrincipal(identity);

        // Set the authentication method
        // principal.SetAuthenticationMethod("pwd");

        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IActionResult> HandleExchangeClientCredentialsGrantType(OpenIddictRequest request)
    {
        var application = await _applicationManager.FindByClientIdAsync(request.ClientId);
        if (application == null)
        {
            throw new InvalidOperationException("The application details cannot be found in the database.");
        }

        // Create the claims-based identity that will be used by OpenIddict to generate tokens.
        var identity = new ClaimsIdentity(
            authenticationType: TokenValidationParameters.DefaultAuthenticationType,
            nameType: Claims.Name,
            roleType: Claims.Role);

        // Add the claims that will be persisted in the tokens (use the client_id as the subject identifier).
        identity.AddClaim(Claims.Subject, await _applicationManager.GetClientIdAsync(application));
        identity.AddClaim(Claims.Name, await _applicationManager.GetDisplayNameAsync(application));

        // Note: In the original OAuth 2.0 specification, the client credentials grant
        // doesn't return an identity token, which is an OpenID Connect concept.
        //
        // As a non-standardized extension, OpenIddict allows returning an id_token
        // to convey information about the client application when the "openid" scope
        // is granted (i.e specified when calling principal.SetScopes()). When the "openid"
        // scope is not explicitly set, no identity token is returned to the client application.

        // Set the list of scopes granted to the client application in access_token.
        var principal = new ClaimsPrincipal(identity);
        principal.SetScopes(request.GetScopes());
        principal.SetResources(await _scopeManager.ListResourcesAsync(principal.GetScopes()).ToListAsync());

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, principal));
        }

        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private async Task<IActionResult> HandleExchangeCodeGrantType()
    {
        // Retrieve the claims principal stored in the authorization code/device code/refresh token.
        var principal = (await HttpContext.AuthenticateAsync(OpenIddictServerAspNetCoreDefaults.AuthenticationScheme)).Principal;

        // Retrieve the user profile corresponding to the authorization code/refresh token.
        // Note: if you want to automatically invalidate the authorization code/refresh token
        // when the user password/roles change, use the following line instead:
        // var user = _signInManager.ValidateSecurityStampAsync(info.Principal);
        var user = await _userManager.GetUserAsync(principal);
        if (user == null)
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The token is no longer valid."
                }));
        }

        // Ensure the user is still allowed to sign in.
        if (!await _signInManager.CanSignInAsync(user))
        {
            return Forbid(
                authenticationSchemes: OpenIddictServerAspNetCoreDefaults.AuthenticationScheme,
                properties: new AuthenticationProperties(new Dictionary<string, string>
                {
                    [OpenIddictServerAspNetCoreConstants.Properties.Error] = Errors.InvalidGrant,
                    [OpenIddictServerAspNetCoreConstants.Properties.ErrorDescription] = "The user is no longer allowed to sign in."
                }));
        }

        foreach (var claim in principal.Claims)
        {
            claim.SetDestinations(GetDestinations(claim, principal));
        }

        // Returning a SignInResult will ask OpenIddict to issue the appropriate access/identity tokens.
        return SignIn(principal, OpenIddictServerAspNetCoreDefaults.AuthenticationScheme);
    }

    private IEnumerable<string> GetDestinations(Claim claim, ClaimsPrincipal principal)
    {
        // Note: by default, claims are NOT automatically included in the access and identity tokens.
        // To allow OpenIddict to serialize them, you must attach them a destination, that specifies
        // whether they should be included in access tokens, in identity tokens or in both.

        switch (claim.Type)
        {
            case Claims.Name:
                yield return Destinations.AccessToken;

                if (principal.HasScope(Scopes.Profile))
                    yield return Destinations.IdentityToken;

                yield break;

            case Claims.Email:
                yield return Destinations.AccessToken;

                if (principal.HasScope(Scopes.Email))
                    yield return Destinations.IdentityToken;

                yield break;

            case Claims.Role:
                yield return Destinations.AccessToken;

                if (principal.HasScope(Scopes.Roles))
                    yield return Destinations.IdentityToken;

                yield break;

            // Never include the security stamp in the access and identity tokens, as it's a secret value.
            case "AspNet.Identity.SecurityStamp": yield break;

            default:
                yield return Destinations.AccessToken;
                yield break;
        }
    }
}