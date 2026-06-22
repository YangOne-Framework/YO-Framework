// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Module
{
    [Table("ModuleOperationJournal")]
    public class ModuleOperationJournal
    {
        [Key]
        public long ModuleOperationJournalId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string ModuleVersion { get; set; } = string.Empty;
        public string OperationType { get; set; } = string.Empty;
        public string OperationStatus { get; set; } = string.Empty;
        public string LifecycleState { get; set; } = string.Empty;
        public string RuntimeState { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string PayloadJson { get; set; } = string.Empty;
        public string ErrorJson { get; set; } = string.Empty;
        public DateTime StartedOn { get; set; }
        public DateTime CompletedOn { get; set; }
        public long RequestedBy { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}
