using System.ComponentModel.DataAnnotations;

namespace YangOne.Web.Dto;

/// <summary>
/// Request model for saving an HTML component.
/// </summary>
public class HtmlComponentSaveRequest
{
    public int HtmlComponentId { get; set; }

    [Required(ErrorMessage = "HtmlComponent.Name.Required")]
    public string Name { get; set; }

    [Required(ErrorMessage = "HtmlComponent.DisplayName.Required")]
    public string DisplayName { get; set; }

    public string ShortDescription { get; set; }
    public string Icon { get; set; }
    public string PreviewImage { get; set; }
    public string Config { get; set; }
    public string ContentStructure { get; set; }
    public string HtmlTemplate { get; set; }
    public string StateSchema { get; set; }
    public string ApiBindings { get; set; }
    public string EventBindings { get; set; }
    public string RuntimeOptions { get; set; }
    public string Version { get; set; }
    public bool IsActive { get; set; }
    public string CatalogCategory { get; set; }
}
