namespace YangOne.Web.API;

public class RateLimitOptions
{
    public int TokenLimit { get; set; }
    public int TokensPerPeriod { get; set; }
    public int ReplenishmentSeconds { get; set; }
}