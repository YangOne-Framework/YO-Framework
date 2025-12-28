namespace YangOne.IdentityServer.Dto;

public class DashboardDto
{
    public int ApplicationCount { get; set; }
    public int ScopeCount { get; set; }
    public int TokenCount { get; set; }
    public int AuthorizationCount { get; set; }
}