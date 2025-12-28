using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model;

[Table("Unsubscription")]
public class UnSubscription
{
    [Key]
    public int UnSubscriptionId { get; set; }
    [Required]
    public string Email { get; set; }
    public bool Newsletter { get; set; }
    public bool Promotional { get; set; }
    public bool Informative { get; set; }
    public bool Transactional { get; set; }
    public bool AllEmail { get; set; }
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

    [IgnoreAll]
    public int RowTotal { get; set; }
}