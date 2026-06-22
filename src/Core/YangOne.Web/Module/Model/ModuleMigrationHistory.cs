// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Module
{
    [Table("ModuleMigrationHistory")]
    public class ModuleMigrationHistory
    {
        [Key]
        public long ModuleMigrationHistoryId { get; set; }
        public string ModuleName { get; set; } = string.Empty;
        public string ModuleVersion { get; set; } = string.Empty;
        public string MigrationName { get; set; } = string.Empty;
        public string MigrationType { get; set; } = string.Empty;
        public string ScriptPath { get; set; } = string.Empty;
        public string ScriptHash { get; set; } = string.Empty;
        public bool Succeeded { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public DateTime AppliedOn { get; set; }
        public long AppliedBy { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}
