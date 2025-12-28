using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.Dto;

public class CreateOrUpdateClientRequest
{
    public string ClientId { get; set; } = default!;
    public string ClientSecret { get; set; } // optional on update
    public string DisplayName { get; set; }
    public string ClientType { get; set; } = OpenIddictConstants.ClientTypes.Confidential;
    public string ConsentType { get; set; } = OpenIddictConstants.ConsentTypes.Explicit;

    public List<string> RedirectUris { get; set; } = new();
    public List<string> PostLogoutRedirectUris { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}