// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

/// <summary>
/// Represents a class DeviceRemovalViewModel.
/// </summary>
public class DeviceRemovalViewModel
{
    [Required]
    public long UserDeviceId { get; set; }
}
