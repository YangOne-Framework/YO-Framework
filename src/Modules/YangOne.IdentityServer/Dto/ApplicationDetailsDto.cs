namespace YangOne.IdentityServer.Dto;

public class ApplicationDetailsDto : ApplicationListItemDto
{
    public List<string> RedirectUris { get; set; } = new();
    public List<string> PostLogoutRedirectUris { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<string> GrantTypes { get; set; } = new();
}