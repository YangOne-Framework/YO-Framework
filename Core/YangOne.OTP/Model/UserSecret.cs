using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.OTP.Model
{
    [Table("UserSecretKey")]
    public class UserSecretKey
    {
        [Key]
        public long UserSecretKeyId { get; set; }
        public long UserId { get; set; }
        public string SecretKey { get; set; }

        [AutoFill(AutoFillProperty.CurrentUser)]
        [IgnoreUpdate]
        public string AddedBy { get; set; }

        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreUpdate]
        public DateTime AddedOn { get; set; }


        [AutoFill(AutoFillProperty.CurrentUser)]
        [IgnoreInsert]
        public string UpDatedBy { get; set; }

        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        public DateTime UpdatedOn { get; set; }

        [IgnoreInsert]
        public bool IsDeleted { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }

    }
}
