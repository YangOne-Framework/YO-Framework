using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.OTP.Model;

[Table("OTPSetting")]
public class OTPSetting
{
    [Key]
    public int OTPSettingId { get; set; }
    public int ExpiryTime { get; set; }//in seconds
    public bool SendFromSMS { get; set; }
    public bool SendFromEmail { get; set; }
    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreUpdate]
    public long AddedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreUpdate]
    public DateTime AddedOn { get; set; }


    [AutoFill(AutoFillProperty.CurrentUserId)]
    [IgnoreInsert]
    public long UpDatedBy { get; set; }

    [AutoFill(AutoFillProperty.CurrentDate)]
    [IgnoreInsert]
    public DateTime UpdatedOn { get; set; }

    [IgnoreInsert]
    public bool IsDeleted { get; set; }

    [IgnoreAll]
    public int RowTotal { get; set; }
}