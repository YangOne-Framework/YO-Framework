// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
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
