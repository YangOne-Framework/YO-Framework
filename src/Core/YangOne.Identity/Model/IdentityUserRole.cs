using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    [Table("IdentityUserRole")]
    public class IdentityUserRole
    {
        //[Key]
        public long UserId { get; set; }
       // [Key]
        public long RoleId { get; set; }
    }
}