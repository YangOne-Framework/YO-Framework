// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using YandOne.Admin.ViewModel;

namespace YangOne.Admin.Dto;
/// <summary>
/// Represents a class CheckSeoUrlRequest.
/// </summary>
public class CheckSeoUrlRequest
{
    public string Url { get; set; }
    public string Type { get; set; }
}

/// <summary>
/// Represents a class ModuleActionRequest.
/// </summary>
public class ModuleActionRequest
{
    public string ModuleName { get; set; } = string.Empty;
}

/// <summary>
/// Represents a class LocalizationImportRequest.
/// </summary>
public class LocalizationImportRequest
{
    public IFormFile? ImportFile { get; set; }
}

/// <summary>
/// Represents a class SetDefaultLocaleRequest.
/// </summary>
public class SetDefaultLocaleRequest
{
    public int LocaleRegionId { get; set; }
    public string Culture { get; set; } = string.Empty;
}

/// <summary>
/// Represents a class SetLanguageRequest.
/// </summary>
public class SetLanguageRequest
{
    public string Culture { get; set; } = string.Empty;
}


/// <summary>
/// Represents a class RenameFileRequest.
/// </summary>
public class RenameFileRequest
{
    public string OldFileName { get; set; } = string.Empty;
    public string NewFileName { get; set; } = string.Empty;
    public string? Dir { get; set; }
}

/// <summary>
/// Represents a class UploadFileRequest.
/// </summary>
public class UploadFileRequest
{
    public IFormFile? File { get; set; }
    public string? Dir { get; set; }
}

/// <summary>
/// Represents a class FileTransferRequest.
/// </summary>
public class FileTransferRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
    public string DestinationDir { get; set; } = string.Empty;
}

/// <summary>
/// Represents a class DeleteFilesRequest.
/// </summary>
public class DeleteFilesRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
}
/// <summary>
/// Represents a class ProfilePictureUpdateRequest.
/// </summary>
public class ProfilePictureUpdateRequest
{
   
    public string ImagePath { get; set; }
    public IFormFile? ImageFile { get; set; }

}
/// <summary>
/// Represents a class ChangePasswordRequest.
/// </summary>
public class ChangePasswordRequest
{
    [Required]
    [DataType(DataType.Password)]
    [Display(Name = "Current password")]
    public string OldPassword { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "New password")]
    public string NewPassword { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Confirm new password")]
    [Compare("NewPassword", ErrorMessage = "The new password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }

    public string StatusMessage { get; set; }

    public string EmailOrUserName { get; set; }
}
/// <summary>
/// Represents a class OtpPasswordResetRequest.
/// </summary>
public class OtpPasswordResetRequest
{
    public string Email { get; set; }

    [Required(ErrorMessage = "OTP is required")]
    public string OtpCode { get; set; }
    public string Password { get; set; }

    [Compare("Password", ErrorMessage = "The new password and confirmation password do not match.")]
    public string ConfirmPassword { get; set; }

    public bool IsOtpVerified { get; set; } = false;
}
/// <summary>
/// Represents a class VerifyOtpRequest.
/// </summary>
public class VerifyOtpRequest
{
    public string Email { get; set; }
    public string OtpCode { get; set; }

}
/// <summary>
/// Represents a class RestPasswordRequest.
/// </summary>
public class RestPasswordRequest
{
    public string Email { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; }
}
/// <summary>
/// Represents a class SetDefaultProviderRequest.
/// </summary>
public class SetDefaultProviderRequest
{
    public int Id { get; set; }
}

/// <summary>
/// Represents a class SaveUserTimeZoneRequest.
/// </summary>
public class SaveUserTimeZoneRequest
{
    public long UserId { get; set; }
    public int TimeZoneId { get; set; }
}

/// <summary>
/// Represents a class ChangePasswordByAdminRequest.
/// </summary>
public class ChangePasswordByAdminRequest
{
    [Required]
    [StringLength(100, ErrorMessage = "The {0} must be at least {2} and at max {1} characters long.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "New password")]
    public string NewPassword { get; set; }
    public string EmailOrUserName { get; set; }
    public long IdentityUserId { get; set; }
}
