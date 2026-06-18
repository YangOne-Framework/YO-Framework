// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Identity.Dto;

/// <summary>
/// Represents the result of a user operation.
/// </summary>
public class UserStatus
{
    public bool HasError { get; set; }
    public string Message { get; set; }
    public long IdentityUserId { get; set; }
}
