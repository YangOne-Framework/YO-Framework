// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
namespace YangOne.Web.Model;
    [Table("ApplicationController")]
    /// <summary>
    /// Represents an application controller registered for permission management.
    /// </summary>
    public class ApplicationController
    {
        [Key]
        public int ApplicationControllerId { get; set; }
        public string Name { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }
    }


