namespace YangOne.IdentityServer.Dto;

public class PagedResult<T>
{
    public int Offset { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public List<T> Items { get; set; } = new();
}