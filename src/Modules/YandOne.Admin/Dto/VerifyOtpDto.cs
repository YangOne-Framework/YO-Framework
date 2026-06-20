// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Admin.Dto;

public class VerifyOtpResponseDto
{
    public VerifyOtpResponseDto() { }
    public VerifyOtpResponseDto(bool isVerified, string resetToken)
    {
        IsVerified = isVerified;
        ResetToken = resetToken;
    }
    public bool IsVerified { get; set; }
    public string ResetToken { get; set; }
}

public class VerifyOtpRequestDto
{
    public string Email { get; set; }
    public string OtpCode { get; set; }
}

public class ResetPasswordRequestDto
{
    public string Email { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; }
}
