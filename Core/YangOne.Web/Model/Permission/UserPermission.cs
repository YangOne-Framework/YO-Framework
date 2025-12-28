using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web
{
    [Table("UserPermission")]
    public class UserPermission
    {
        public int UserPermissionId { get; set; }
        public int ApplicationControllerActionId { get; set; }
        public int ApplicationControllerId { get; set; }
        public long UserId { get; set; }
        public bool AllowAccess { get; set; }
        [IgnoreAll]
        public string ActionUrl { get; set; }

        [IgnoreAll]
        public string RouteUrl { get; set; }
        [IgnoreAll]
        public string FriendlyUrl { get; set; }
        [IgnoreAll]
        public string ControllerName { get; set; }

    }


}
