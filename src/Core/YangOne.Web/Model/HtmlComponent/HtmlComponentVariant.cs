using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model;

[Table("HtmlComponentVariant")]
public class HtmlComponentVariant
{
    [Key]
    public int HtmlComponentVariantId { get; set; }
    public int HtmlComponentId { get; set; }
    [Required]
    public string VariantKey { get; set; }
    [Required]
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

    [AutoFill(false)]
    public bool IsDeleted { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreUpdate]
    public DateTime AddedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long AddedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long DeletedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime UpdatedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime DeletedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreInsert]
    public long UpdatedBy { get; set; }
}
