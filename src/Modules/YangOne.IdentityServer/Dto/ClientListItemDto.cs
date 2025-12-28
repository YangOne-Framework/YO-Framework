namespace YangOne.IdentityServer.Dto;

public class ClientListItemDto
{
    public string Id { get; set; } = default!;
    public string ClientId { get; set; } = default!;
    public string DisplayName { get; set; }
    public string ClientType { get; set; }
    public string ConsentType { get; set; }
}