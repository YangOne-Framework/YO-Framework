using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.Dto;

public class UpdateGrantRequest
{
    public string Status { get; set; } = OpenIddictConstants.Statuses.Valid;
    public string Id { get; set; }
}