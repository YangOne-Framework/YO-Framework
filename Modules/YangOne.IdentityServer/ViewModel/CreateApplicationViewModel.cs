using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.ViewModel;

public class CreateApplicationViewModel
{
    [Required]
    [Display(Name = "Client ID")]
    public string ClientId { get; set; }

    [Display(Name = "Client Secret")]
    public string ClientSecret { get; set; }

    [Required]
    [Display(Name = "Display Name")]
    public string DisplayName { get; set; }

    [Required]
    [Display(Name = "Client Type")]
    public string ClientType { get; set; } = OpenIddictConstants.ClientTypes.Confidential;

    [Required]
    [Display(Name = "Consent Type")]
    public string ConsentType { get; set; } = OpenIddictConstants.ConsentTypes.Explicit;

    [Display(Name = "Redirect URIs (one per line)")]
    public string RedirectUris { get; set; }

    [Display(Name = "Post Logout Redirect URIs (one per line)")]
    public string PostLogoutRedirectUris { get; set; }

    [Display(Name = "Permissions")]
    public List<string> Permissions { get; set; } = new List<string>();

    public List<string> AvailablePermissions { get; set; }
    public List<string> AvailableGrantTypes { get; set; }
    public List<string> AvailableConsentTypes { get; set; }
}