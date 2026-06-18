// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Identity.Model;

namespace YangOne.Identity.Dto;

/// <summary>
/// Represents the registration model for application users.
/// </summary>
public class AppUserRegisterModel : AppUser
{
    public string Password { get; set; }
    public string ConfirmPassword { get; set; }
    public List<int> RoleIds { get; set; } = new();
}
