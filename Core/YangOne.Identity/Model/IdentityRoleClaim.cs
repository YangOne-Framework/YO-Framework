using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    [Table("IdentityRoleClaim")]
    public class IdentityRoleClaim
    {
        [Key]
        public long Id { get; set; }

        public long RoleId { get; set; }

        public string ClaimType { get; set; }

        public string ClaimValue { get; set; }
    }
}