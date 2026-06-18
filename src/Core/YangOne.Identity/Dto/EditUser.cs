// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

/// <summary>
/// Represents an edit user data transfer object.
/// </summary>
public class EditUser : AppUser
{

    public List<int> UserRoleIds { get; set; }
    public List<UserRolesSelected> UserRoles { get; set; }


}
