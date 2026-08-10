namespace YangOne.Web.Dto;

/// <summary>
/// Optional filters for the HTML component catalog list.
/// All fields are optional; omitted filters are ignored.
/// </summary>
public class HtmlComponentQueryRequest
{
    public int Offset { get; set; } = 1;
    public int Limit { get; set; } = 20;
    public string Query { get; set; } = "";
    public string Category { get; set; }
    public string Tag { get; set; }
    public string Source { get; set; }
    public bool IncludeVariants { get; set; }
}
