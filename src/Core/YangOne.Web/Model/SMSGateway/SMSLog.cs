// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
namespace YangOne.Web.Model;
    [Table("SMSLog")]
    /// <summary>
    /// Represents a log entry for an SMS message sent through the system.
    /// </summary>
    public class SMSLog
    {

        [Key]
        public long SMSLogId { get; set; }
      
        public string From { get; set; }
        public string To { get; set; }
        public string Body { get; set; }
        public string GatewayResponse { get; set; }
        
        public DateTime SentDate { get; set; }
        public DateTime DeliveredDate { get; set; }
       
        public bool IsSent { get; set; }
        public bool IsDelivered { get; set; }
        
        [AutoFill(AutoFillProperty.CurrentUser)]
        [IgnoreUpdate]
        public string AddedBy { get; set; }
        
       
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreUpdate]
        public DateTime AddedOn { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }
    }


