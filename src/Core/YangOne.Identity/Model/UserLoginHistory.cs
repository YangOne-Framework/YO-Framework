// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Identity.Model
{
    /// <summary>
    /// Represents a user login history record.
    /// </summary>
    [Table("UserLoginHistory")]
    public class UserLoginHistory
    {
        [Key]
        public int UserLoginHistoryId { get; set; }
        public long UserId { get; set; }
        public string IpAddress { get; set; }
        public DateTime LastLogin { get; set; }
        public bool IsFromWeb { get; set; }
        public bool IsFromMobile { get; set; }
        public string UserDevice { get; set; }
        public string Browser { get; set; }
        public string Device { get; set; }
        public bool IsActive { get; set; }
        [IgnoreInsert]
        [AutoFill(false)]
        public bool IsDeleted { get; set; }
        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreUpdate]
        public long AddedBy { get; set; }

        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreUpdate]
        public DateTime AddedOn { get; set; }
        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreInsert]
        public long UpDatedBy { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        public DateTime UpdatedOn { get; set; }
        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreInsert]
        public long DeletedBy { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        public DateTime DeletedOn { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}
