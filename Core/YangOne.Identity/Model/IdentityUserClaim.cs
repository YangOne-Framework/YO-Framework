using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    [Table("IdentityUserClaim")]
    public class IdentityUserClaim
    {
        [Key]
        public long Id { get; set; }

        public long UserId { get; set; }

        public string ClaimType { get; set; }

        public string ClaimValue { get; set; }
    }
}