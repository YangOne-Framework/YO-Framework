// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Theme
{
    /// <summary>
    /// View model for theme upload.
    /// </summary>
    public class ThemeViewModel
    {
        [Required]
        public IFormFile ThemeZip { get; set; }
    }

    /// <summary>
    /// Represents the result of a theme installation operation.
    /// </summary>
    public class ThemeStatus
    {
        public bool IsInstalled { get; set; }
        public string Error { get; set; }
        public bool HasError { get; set; }

    }
}
