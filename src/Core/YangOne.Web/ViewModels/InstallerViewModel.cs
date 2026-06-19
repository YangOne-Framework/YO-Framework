// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using YangOne.Data.Crud;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.ViewModels
{
   
    /// <summary>
    /// View model for the initial installer user account setup.
    /// </summary>
    public class InstallerUserViewModel
    {
        [Required]
        public string SiteName { get; set; }
        [EmailAddress]
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public int TimeZoneId { get; set; }
    }
 
}

