using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Model
{
    public class YangOneIdentityRole : YangOneIdentityRole<int>
    {
        public YangOneIdentityRole() { }
        public YangOneIdentityRole(string roleName) : this()
        {
            Name = roleName;
        }
    }

    public class YangOneIdentityRole<TKey> : YangOneIdentityRole<TKey, YangOneIdentityUserRole<TKey>, YangOneIdentityRoleClaim<TKey>>
        where TKey : IEquatable<TKey>
    {
        public YangOneIdentityRole() { }
        public YangOneIdentityRole(string roleName) : this()
        {
            Name = roleName;
        }
    }

    public class YangOneIdentityRole<TKey, TUserRole, TRoleClaim>
        where TKey : IEquatable<TKey>
        where TUserRole : YangOneIdentityUserRole<TKey>
        where TRoleClaim : YangOneIdentityRoleClaim<TKey>
    {
        #region Properties 

        public virtual ICollection<TUserRole> Users { get; } = new List<TUserRole>();
        public virtual ICollection<TRoleClaim> Claims { get; } = new List<TRoleClaim>();
        public virtual TKey Id { get; set; }
        [Required(ErrorMessage ="Role.Name.Required")]
        public virtual string Name { get; set; }

       /// public virtual bool IsSystem { get; set; } 
        #endregion

        #region Constructors

        public YangOneIdentityRole() { }

        public YangOneIdentityRole(string roleName) : this()
        {
            Name = roleName;
        }

        #endregion
    }
}
