// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace YangOne.Web.Model;

    [Table("AppController")]
    /// <summary>
    /// Represents an application controller registered in the system.
    /// </summary>
    public class AppController
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
    }


