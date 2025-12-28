using System.ComponentModel.DataAnnotations;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Installer;

//public class InstallerInfo
//{
//    [Required]
//    public string SiteName { get; set; }
//    [EmailAddress]
//    [Required]
//    public string Email { get; set; }
//    [Required]
//    public string Password { get; set; }
//    [Required]
//    [IgnoreAll]
//    public TimeSpan TimeOffset { get; set; }
//    public string TimeZoneOffset {
//        get
//        {
//            if (TimeOffset.Hours > 0)
//                return "+" + TimeOffset.ToString(@"hh\:mm");
//            return "-" + TimeOffset.ToString(@"hh\:mm");
//        }
//    }
//    public string TimeZoneName { get; set; }        
//}