// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model
{
    [Table("AuditLog")]
    /// <summary>
    /// Represents an audit log entry tracking URL access, user activity and request data.
    /// </summary>
    public class Audit
    {
        [Key]
        public long AuditId { get; set; }
        public string Url { get; set; }
        public string Action { get; set; }
        public int Duration { get; set; }
        public string UserName { get; set; }
        public string Role { get; set; }
        public string IpAddress { get; set; }
        public string UserAgent { get; set; }
        public string RequestObject { get; set; }
        [IgnoreInsert]
        public DateTime AddedOn { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }


    }
}

