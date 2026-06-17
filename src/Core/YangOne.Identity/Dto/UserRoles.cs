// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

public class UserRoles
{
    public long IdentityUserId { get; set; }
    public List<IdentityRole> Roles { get; set; }
}
