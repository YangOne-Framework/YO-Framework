using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
namespace YangOne.Web.Model;
    [Table("RolePermission")]
    public class RolePermission
    {
        public int Id { get; set; }
        public int AppControllerUrlId { get; set; }
        public int RoleId { get; set; }
        public bool HavePermission { get; set; }
        [IgnoreAll]
        public string ActionUrl { get; set; }
        
        [IgnoreAll]
        public string RouteUrl { get; set; }
        [IgnoreAll]
        public string FriendlyUrl { get; set; }
        [IgnoreAll]
        public string ControllerName { get; set; }
        [IgnoreAll]
        public string ControllerId { get; set; }
        [IgnoreAll]
        public bool AllowAccess { get; set; }
    }
    public sealed class RolePermissionViewModel
    {
        public List<RolePermission> RolePermission { get; set; }
    }



