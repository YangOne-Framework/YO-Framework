// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
namespace YangOne.Web.Model;
    [Table("MasterRolePermission")]
    /// <summary>
    /// Represents permission settings assigned to roles for controller actions.
    /// </summary>
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

    /// <summary>
    /// View model containing a list of user permissions.
    /// </summary>
    public sealed class UserPermissionViewModel
    {
        public List<UserPermission> UserPermission { get; set; }
    }




