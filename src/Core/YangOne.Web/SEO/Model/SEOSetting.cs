// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model
{
    [Table("SeoSetting")]
    public class SEOSetting
    {
        [Key]
        public int SEOSettingId { get; set; }
    }
}
