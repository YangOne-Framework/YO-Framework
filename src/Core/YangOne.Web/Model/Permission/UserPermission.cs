using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
namespace YangOne.Web.Model;
    [Table("UserPermission")]
    public class UserPermission
    {
        [Key]
        public int UserPermissionId { get; set; }
        public int ApplicationControllerActionId { get; set; }
        public int ApplicationControllerId { get; set; }
        public long UserId { get; set; }
        public bool AllowAccess { get; set; }

        public bool IsActive { get; set; }
        [IgnoreAll]
        public bool IsDeleted { get; set; }
        [IgnoreUpdate]
        [AutoFill(AutoFillProperty.CurrentDate)]
        public DateTime AddedOn { get; set; }
        [IgnoreUpdate]
        [AutoFill(AutoFillProperty.CurrentUserId)]
        public long AddedBy { get; set; }
        [IgnoreAll]
        [AutoFill(AutoFillProperty.CurrentUserId)]
        public long DeletedBy { get; set; }
        [IgnoreUpdate]
        [IgnoreInsert]
        public DateTime DeletedOn { get; set; }
        [IgnoreInsert]
        [AutoFill(AutoFillProperty.CurrentDate)]
        public DateTime UpdatedOn { get; set; }
        [IgnoreInsert]
        [AutoFill(AutoFillProperty.CurrentUserId)]
        public long UpdatedBy { get; set; }

        [IgnoreAll]
        public string ActionUrl { get; set; }
        [IgnoreAll]
        public string RouteUrl { get; set; }
        [IgnoreAll]
        public string FriendlyUrl { get; set; }
        [IgnoreAll]
        public string ControllerName { get; set; }

        [IgnoreAll]
        public bool RoleAllowAccess { get; set; }

        [IgnoreAll]
        public bool HasUserOverride { get; set; }

        [IgnoreAll]
        public bool UserOverrideAccess { get; set; }

        [IgnoreAll]
        public bool EffectiveAccess { get; set; }
    }

