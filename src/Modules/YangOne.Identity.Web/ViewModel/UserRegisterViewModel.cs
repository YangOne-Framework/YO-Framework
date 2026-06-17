// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Model;

namespace YangOne.Identity.Web.ViewModel
{
    public class UserRegisterViewModel : AppUser
    {
        public int[] Roles { get; set; }
        public string Password { get; set; }
    }
}

