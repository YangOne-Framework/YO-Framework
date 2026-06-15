using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model;

[Table("EmailTemplate")]
public sealed class EmailTemplate
{
    [Key]
    public int TemplateId { get; set; }
    [Required]
    public string TemplateName { get; set; }
    public string TemplateType { get; set; }
    public string Template { get; set; }
    public string HeaderTemplate { get; set; }
    public string FooterTemplate { get; set; }
    [Required]
    public string EmailSubject { get; set; }
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

    [IgnoreAll]
    public int RowTotal { get; set; }

    [IgnoreAll]
    public string FullTemplate => $"{HeaderTemplate}{Template}{FooterTemplate}";

}