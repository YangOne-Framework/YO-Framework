using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web
{
    [Table("MasterRolePermission")]
    public class MasterRolePermission
    {
        [Key]
        public int MasterRolePermissionId { get; set; }
        public int ApplicationControllerActionId { get; set; }
        public int ApplicationControllerId { get; set; }
        public int RoleId { get; set; }
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
        public int RowTotal { get; set; }

        [IgnoreAll]
        public string ActionUrl { get; set; }
        
        [IgnoreAll]
        public string RouteUrl { get; set; }
        [IgnoreAll]
        public string FriendlyName { get; set; }
        [IgnoreAll]
        public string ControllerName { get; set; }

    }

    public sealed class RolePermissionViewModel
    {
        public List<MasterRolePermission> RolePermission { get; set; }
    }


}
