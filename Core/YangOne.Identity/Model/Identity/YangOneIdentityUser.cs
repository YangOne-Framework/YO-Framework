using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Model
{
    public class YangOneIdentityUser : YangOneIdentityUser<int>
    {
        public YangOneIdentityUser() { }

        public YangOneIdentityUser(string userName) : this()
        {
            UserName = userName;
        }
    }

    public class YangOneIdentityUser<TKey> : YangOneIdentityUser<TKey, YangOneIdentityUserClaim<TKey>, YangOneIdentityUserRole<TKey>, YangOneIdentityUserLogin<TKey>>
       where TKey : IEquatable<TKey>
    {
        public YangOneIdentityUser() { }

        public YangOneIdentityUser(string userName) : this()
        {
            UserName = userName;
        }
    }

    public class YangOneIdentityUser<TKey, TUserClaim, TUserRole, TUserLogin> where TKey : IEquatable<TKey>
    {
        public YangOneIdentityUser() { }
        public YangOneIdentityUser(string userName) : this()
        {
            UserName = userName;
        }
        [Key]
        public virtual TKey Id { get; set; }
        public virtual string UserName { get; set; }
        public virtual string Email { get; set; }
        public virtual bool EmailConfirmed { get; set; }
        public virtual string PasswordHash { get; set; }
        public virtual string SecurityStamp { get; set; }
        public virtual string ConcurrencyStamp { get; set; } = Guid.NewGuid().ToString();
        public virtual string PhoneNumber { get; set; }
        public virtual bool PhoneNumberConfirmed { get; set; }
        public virtual bool TwoFactorEnabled { get; set; }
        public virtual DateTimeOffset? LockoutEnd { get; set; }
        public virtual bool LockoutEnabled { get; set; }
        public virtual int AccessFailedCount { get; set; }
        public virtual ICollection<TUserRole> Roles { get; } = new List<TUserRole>();
        public virtual ICollection<TUserClaim> Claims { get; } = new List<TUserClaim>();
        public virtual ICollection<TUserLogin> Logins { get; } = new List<TUserLogin>();

        public override string ToString()
        {
            return UserName;
        }
    }
}
