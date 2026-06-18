// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Web.Model;

namespace YangOne.Web
{
    [Table("Page")]
    /// <summary>
    /// View model for page creation and editing, extending SEO metadata.
    /// </summary>
    public class PageViewModel : SEO
    {
        public new long PageId { get; set; }
        [Required(ErrorMessage ="Page.Name.Required")]
        public string Name { get; set; }
        public new string Url { get; set; }
        public string Content { get; set; }
        public bool UseMasterLayout { get; set; }
        public bool IsPublished { get; set; }
        public bool IsNew { get; set; }
        public string OldUrl { get; set; }
        public bool IsBackend { get; set; }
        public bool IsSystem { get; set; }

    }
}
