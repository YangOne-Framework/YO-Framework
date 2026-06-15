using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using YandOne.Admin.ViewModel;

namespace YangOne.Admin.Dto;
public class CheckSeoUrlRequest
{
    public string Url { get; set; }
    public string Type { get; set; }
}

public class ModuleActionRequest
{
    public string ModuleName { get; set; } = string.Empty;
}

public class LocalizationImportRequest
{
    public IFormFile? ImportFile { get; set; }
}

public class SetDefaultLocaleRequest
{
    public int LocaleRegionId { get; set; }
    public string Culture { get; set; } = string.Empty;
}

public class SetLanguageRequest
{
    public string Culture { get; set; } = string.Empty;
}


public class RenameFileRequest
{
    public string OldFileName { get; set; } = string.Empty;
    public string NewFileName { get; set; } = string.Empty;
    public string? Dir { get; set; }
}

public class UploadFileRequest
{
    public IFormFile? File { get; set; }
    public string? Dir { get; set; }
}

public class FileTransferRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
    public string DestinationDir { get; set; } = string.Empty;
}

public class DeleteFilesRequest
{
    public List<MediaLibraryItem> Files { get; set; } = new();
}
public class ProfilePictureUpdateRequest
{
   
    public string ImagePath { get; set; }
    public IFormFile? ImageFile { get; set; }

}
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
public class VerifyOtpRequest
{
    public string Email { get; set; }
    public string OtpCode { get; set; }

}
public class RestPasswordRequest
{
    public string Email { get; set; }
    public string Token { get; set; }
    public string NewPassword { get; set; }
    public string ConfirmPassword { get; set; }
}
public class SetDefaultProviderRequest
{
    public int Id { get; set; }
}

public class SaveUserTimeZoneRequest
{
    public long UserId { get; set; }
    public int TimeZoneId { get; set; }
}

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