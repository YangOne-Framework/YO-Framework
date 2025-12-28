namespace YangOne.Security;

public class CspConfig
{
    public Dictionary<string, List<string>> Directives { get; set; } = new();
    public bool SupportNonce { get; set; }
}