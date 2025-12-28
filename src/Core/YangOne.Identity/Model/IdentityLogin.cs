using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    [Table("IdentityUserLogin")]
    public class IdentityLogin
    {
        public string LoginProvider { get; set; }

        public string ProviderKey { get; set; }

        public long UserId { get; set; }

        public string ProviderDisplayName { get; set; }
      
    }
}