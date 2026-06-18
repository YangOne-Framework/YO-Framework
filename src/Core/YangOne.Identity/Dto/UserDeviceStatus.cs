// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Identity.Dto;

/// <summary>
/// Represents the verification status of a user device.
/// </summary>
public class UserDeviceStatus
{
    public bool MobileDevice { get; set; }
    public int VerifiedDeviceCount { get; set; }
    public bool IsThisUnverifiedLogin { get; set; } 
    public int BrowserCount { get; set; }
    public int MobileCount { get; set; }
}


