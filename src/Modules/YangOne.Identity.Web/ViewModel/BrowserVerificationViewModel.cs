// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace YangOne.Identity.Web.ViewModel;

public class BrowserVerificationViewModel
{
    [Required]
    public string Email { get; set; }

    public string? PhoneNumber { get; set; }
    [Required]
    public string OTP { get; set; }
    public string ReturnUrl { get; set; }
}
