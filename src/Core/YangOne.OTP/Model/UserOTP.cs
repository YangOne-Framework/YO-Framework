// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.OTP.Model;

[Table("UserOTP")]
/// <summary>
/// Represents an OTP code record associated with a user
/// </summary>
public class UserOTP
{
    [Key]
    public long UserOTPId { get; set; }
    public long UserId { get; set; }
    public string OTPCode { get; set; }
    public bool IsExpired { get; set; }
}
