// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("ApplicationControllerAction")]
    /// <summary>
    /// Represents an action URL mapped to an application controller for permission management.
    /// </summary>
    public class ApplicationControllerAction
    {
        [Key]
        public int ApplicationControllerActionId { get; set; }
        public int ApplicationControllerId { get; set; }
        public string ActionUrl { get; set; }
        public string RouteUrl { get; set; }
        public string FriendlyName { get; set; }
    }


