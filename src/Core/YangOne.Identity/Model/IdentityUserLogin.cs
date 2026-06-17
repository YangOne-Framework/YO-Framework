// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model
{
    [Table("IdentityUserLogin")]
    public class IdentityUserLogin
    {
        public long UserId { get; set; }

        public string ProviderKey { get; set; }

        public string LoginProvider { get; set; }

        public string ProviderDisplayName { get; set; }
    }
}
