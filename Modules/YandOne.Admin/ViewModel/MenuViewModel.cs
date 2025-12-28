using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;
using YangOne.Web.Model;

namespace YandOne.Admin.ViewModel
{
    public class MenuViewModel : Menu { 
        public List<MenuPermission> Permissions { get; set; }
    }

    public class MenuOrderViewModel
    {
        public int MenuId { get; set; }
        public int MenuOrder { get; set; }
        public int ParentId { get; set; }
    }

    public class FooterMenuViewModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<Menu> Children { get; set; }
    }

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
    public class DirectoryViewModel
    {
        public string DirName { get; set; }
        public bool IsRename { get; set; }
        public string DirPath { get; set; }
        public string OldDirName { get; set; }

    }
    public class MediaLibraryStatus
    {
        public bool Success { get; set; }
        public string Message { get; set; }

    }

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
    public class MediaLibraryImage
    {

        public string FileName { get; set; }
        public string RPath { get; set; }
        public DateTime CreationTime { get; set; }
        public string FileSize { get; set; }
    }
    public class MediaLibConst
    {
        public const string MediaLibRootPath = "uploads";
    }
    public class CspConfigViewModel
    {
        public bool SupportNonce { get; set; }

        public List<DirectiveViewModel> Directives { get; set; } = new();
    }

    public class DirectiveViewModel
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Values { get; set; } = string.Empty;
    }
    public class FileConfigViewModel
    {
        public List<FileTypeEntryViewModel> FileTypes { get; set; } = new();
    }

    public class FileTypeEntryViewModel
    {
        public string Extension { get; set; } = string.Empty; // e.g. "png"
        public string MimeTypes { get; set; } = string.Empty; // e.g. "image/png, image/x-png"
    }
}
