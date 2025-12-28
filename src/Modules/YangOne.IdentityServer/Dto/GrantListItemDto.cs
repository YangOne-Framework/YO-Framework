namespace YangOne.IdentityServer.Dto;

public class GrantListItemDto
{
    public string Id { get; set; } = default!;
    public string Subject { get; set; }
    public string ApplicationName { get; set; }
    public DateTimeOffset? CreationDate { get; set; }
    public string Status { get; set; }
    public List<string> Scopes { get; set; } = new();
}