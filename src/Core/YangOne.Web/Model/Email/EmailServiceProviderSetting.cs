// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("EmailServiceProviderSetting")]
    /// <summary>
    /// Represents a key-value setting for an email service provider.
    /// </summary>
    public class EmailServiceProviderSetting
    {
        [Key]
        public int EmailServiceProviderSettingId { get; set; }
        public int EmailServiceProviderId { get; set; }
        [Required]
        public string ProviderKey { get; set; }
        [Required]
        public string ProviderValue { get; set; }
    }
    /// <summary>
    /// View model for email service provider setting with system name.
    /// </summary>
    public class EmailServiceProviderSettingViewModel
    {
        public string SystemName { get; set; }
    }

