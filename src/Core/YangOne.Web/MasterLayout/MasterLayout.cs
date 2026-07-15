using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web;

[Table("MasterLayout")]
public class MasterLayout
{
    [Key]
    public long MasterLayoutId { get; set; }

    [Required]
    public string MasterLayoutUniqueId { get; set; }

    [Required]
    public string Name { get; set; }

    public string Description { get; set; }

    public bool HasHeader { get; set; }

    public bool HasFooter { get; set; }

    public string Sidebar { get; set; }

    public bool IsSystem { get; set; }

    public string LayoutConfig { get; set; }

    public long? YOThemeId { get; set; }

    public bool IsActive { get; set; }

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
    [IgnoreUpdate]
    public DateTime DeletedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime UpdatedOn { get; set; }

    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreInsert]
    public long UpdatedBy { get; set; }

    [IgnoreAll]
    public int RowTotal { get; set; }
}
