namespace YangOne.Web.Dto;

/// <summary>
/// A saved variation of an HTML component. Null override fields inherit from the parent component.
/// </summary>
public class HtmlComponentVariantDto
{
    public int HtmlComponentVariantId { get; set; }
    public int HtmlComponentId { get; set; }
    public string VariantKey { get; set; }
    public string DisplayName { get; set; }
    public string Description { get; set; }
    public string PreviewImage { get; set; }
    public string Config { get; set; }
    public string ContentStructure { get; set; }
    public string HtmlTemplate { get; set; }
    public string StateSchema { get; set; }
    public string ApiBindings { get; set; }
    public string EventBindings { get; set; }
    public string RuntimeOptions { get; set; }
    public string Version { get; set; }
    public int SortOrder { get; set; }
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; }
}
