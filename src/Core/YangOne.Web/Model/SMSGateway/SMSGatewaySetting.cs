// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Web.Model;
    [Table("SMSGatewaySetting")]
    /// <summary>
    /// Represents a key-value setting for an SMS gateway provider.
    /// </summary>
    public class SMSGatewaySetting
    {
        [Key]
        public int SMSGatewaySettingId { get; set; }
        public int SMSGatewayId { get; set; }
        [Required]
        public string GatewayKey { get; set; }
        [Required]
        public string GatewayValue { get; set; }
    }


