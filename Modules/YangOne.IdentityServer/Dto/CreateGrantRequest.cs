using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.Dto;

public class CreateGrantRequest
{
    public string Subject { get; set; } = default!;
    public string Status { get; set; } = OpenIddictConstants.Statuses.Valid;
    public string? ApplicationId { get; set; }
    public List<string> Scopes { get; set; } = new();
}