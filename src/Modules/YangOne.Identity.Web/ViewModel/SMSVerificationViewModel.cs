// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

/// <summary>
/// Represents a class SMSVerificationViewModel.
/// </summary>
public class SMSVerificationViewModel
{
    public string PhoneNumber { get; set; }
    [Required]
    public string OTP { get; set; }
    public string Email { get; set; }
}
