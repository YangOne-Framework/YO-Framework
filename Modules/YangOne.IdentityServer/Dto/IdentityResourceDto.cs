namespace YangOne.IdentityServer.Dto;

public class IdentityResourceDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string DisplayName { get; set; }
    public string Description { get; set; }
}