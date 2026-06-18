// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    /// <summary>
    /// Represents an external login provider association.
    /// </summary>
    [Table("IdentityUserLogin")]
    public class IdentityLogin
    {
        public string LoginProvider { get; set; }

        public string ProviderKey { get; set; }

        public long UserId { get; set; }

        public string ProviderDisplayName { get; set; }
      
    }
}
