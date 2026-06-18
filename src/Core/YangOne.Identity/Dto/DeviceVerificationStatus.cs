// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Identity.Dto;

/// <summary>
/// Represents the result of a device verification operation.
/// </summary>
public class DeviceVerificationStatus
{
    public bool IsVerified { get; set; }
    public string Message { get; set; }
}
