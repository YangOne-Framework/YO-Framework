namespace YangOne.Web.Dto;

/// <summary>
/// Data transfer object with full details of an HTML component.
/// </summary>
public class HtmlComponentDetailDto : HtmlComponentItemDto
{
    public string Config { get; set; }
    public string ContentStructure { get; set; }
    public string HtmlTemplate { get; set; }
    public string StateSchema { get; set; }
    public string ApiBindings { get; set; }
    public string EventBindings { get; set; }
    public string RuntimeOptions { get; set; }
    public string Version { get; set; }
}
