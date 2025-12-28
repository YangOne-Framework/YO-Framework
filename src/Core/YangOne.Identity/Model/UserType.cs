using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Identity.Model;

[Table("UserType")]
public class UserType
{
    [Key]
    public int Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public bool IsActive { get; set; }
    [IgnoreAll]
    public bool IsDeleted { get; set; }
    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreUpdate]
    public DateTime AddedOn { get; set; }
    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long AddedBy { get; set; }
    [IgnoreInsert]
    [AutoFill(AutoFillProperty.CurrentUserId)]
    public long DeletedBy { get; set; }
    [IgnoreInsert]
    [AutoFill(AutoFillProperty.CurrentDate)]
    public DateTime DeletedOn { get; set; }
    [IgnoreInsert]
    [AutoFill(AutoFillProperty.CurrentDate)]
    public DateTime UpdatedOn { get; set; }
    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreInsert]
    public long UpdatedBy { get; set; }
    [IgnoreAll]
    public int RowTotal { get; set; }
}