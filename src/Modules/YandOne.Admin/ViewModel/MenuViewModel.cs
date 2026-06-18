// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;
using YangOne.Web.Model;

namespace YandOne.Admin.ViewModel
{
    /// <summary>
    /// Represents a class MenuViewModel.
    /// </summary>
    public class MenuViewModel : Menu { 
        public List<MenuPermission> Permissions { get; set; }
    }

    /// <summary>
    /// Represents a class MenuOrderViewModel.
    /// </summary>
    public class MenuOrderViewModel
    {
        public int MenuId { get; set; }
        public int MenuOrder { get; set; }
        public int ParentId { get; set; }
    }

    /// <summary>
    /// Represents a class FooterMenuViewModel.
    /// </summary>
    public class FooterMenuViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Menu> Children { get; set; }
    }

    /// <summary>
    /// Represents a class UserImportViewModel.
    /// </summary>
    public class UserImportViewModel
    {
        public List<UserRolesSelected> UserRoles { get; set; }=new List<UserRolesSelected>();
        public IFormFile ImportFile { get; set; }
        public bool AutoGenerateUserName { get; set; } = false;
        public bool AutoGenerateEmailAddress { get; set; } = false;
        public List<AppUser> Users { get; set; } = new List<AppUser>();
        public bool ImportStatus { get; set; } = false;
        public string Message { get; set; }
    }
    /// <summary>
    /// Represents a class DirectoryViewModel.
    /// </summary>
    public class DirectoryViewModel
    {
        public string DirName { get; set; }
        public bool IsRename { get; set; }
        public string DirPath { get; set; }
        public string OldDirName { get; set; }

    }
    /// <summary>
    /// Represents a class MediaLibraryStatus.
    /// </summary>
    public class MediaLibraryStatus
    {
        public bool Success { get; set; }
        public string Message { get; set; }

    }

    /// <summary>
    /// Represents a class MediaLibraryItem.
    /// </summary>
    public class MediaLibraryItem
    {
        public bool IsDirectory { get; set; }
        public string FileName { get; set; }
        //public FileInfo FileInfo { get; set; }
        //public DirectoryInfo DirInfo { get; set; }
        public string RDirectoryPath { get; set; }
        public string RFilePath { get; set; }
        public DateTime CreationTime { get; set; }
        public string FileSize { get; set; }
    }
    /// <summary>
    /// Represents a class MediaLibraryImage.
    /// </summary>
    public class MediaLibraryImage
    {

        public string FileName { get; set; }
        public string RPath { get; set; }
        public DateTime CreationTime { get; set; }
        public string FileSize { get; set; }
    }
    /// <summary>
    /// Represents a class MediaLibConst.
    /// </summary>
    public class MediaLibConst
    {
        public const string MediaLibRootPath = "uploads";
    }
    /// <summary>
    /// Represents a class CspConfigViewModel.
    /// </summary>
    public class CspConfigViewModel
    {
        public bool SupportNonce { get; set; }

        public List<DirectiveViewModel> Directives { get; set; } = new();
    }

    /// <summary>
    /// Represents a class DirectiveViewModel.
    /// </summary>
    public class DirectiveViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Values { get; set; } = string.Empty;
    }
    /// <summary>
    /// Represents a class FileConfigViewModel.
    /// </summary>
    public class FileConfigViewModel
    {
        public List<FileTypeEntryViewModel> FileTypes { get; set; } = new();
    }

    /// <summary>
    /// Represents a class FileTypeEntryViewModel.
    /// </summary>
    public class FileTypeEntryViewModel
    {
        public string Extension { get; set; } = string.Empty; // e.g. "png"
        public string MimeTypes { get; set; } = string.Empty; // e.g. "image/png, image/x-png"
    }
}

