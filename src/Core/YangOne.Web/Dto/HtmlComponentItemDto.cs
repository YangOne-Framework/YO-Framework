namespace YangOne.Web.Dto;

/// <summary>
/// Data transfer object for a summary of an HTML component.
/// </summary>
public class HtmlComponentItemDto
{
    public int HtmlComponentId { get; set; }
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public string ShortDescription { get; set; }
    public string Icon { get; set; }
    public string PreviewImage { get; set; }
    public bool IsActive { get; set; }
    public string CatalogCategory { get; set; }
    public int RowTotal { get; set; }
}
