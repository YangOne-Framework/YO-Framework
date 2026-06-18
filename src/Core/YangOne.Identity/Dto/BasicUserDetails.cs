// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Identity.Dto;

/// <summary>
/// Represents basic user detail information.
/// </summary>
public sealed class BasicUserDetails
{
    public string FullName { get; set; }
    public long UserId { get; set; }
}
