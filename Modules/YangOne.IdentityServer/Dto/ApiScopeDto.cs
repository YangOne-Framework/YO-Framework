namespace YangOne.IdentityServer.Dto;

public class ApiScopeDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;          // without api_ in API surface
    public string DisplayName { get; set; }
    public string Description { get; set; }
}