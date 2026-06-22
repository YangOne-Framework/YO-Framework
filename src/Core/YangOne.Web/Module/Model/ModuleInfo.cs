// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Module
{
    [Table("Module")]
    /// <summary>
    /// Represents a module record in the database.
    /// </summary>
    public class ModuleInfo
    {
        [Key]
        public int ModuleId { get; set; }
        [Required(ErrorMessage = "Module.Name.Required")]
        public string Name { get; set; }
        public string Description { get; set; }
        public string Version { get; set; }
        public bool IsInstalled { get; set; }
        public string Author { get; set; }
        public string DisplayName { get; set; }
        public string ModuleKey { get; set; }
        public string ActiveVersion { get; set; }
        public string StagedVersion { get; set; }
        public string LifecycleState { get; set; }
        public string RuntimeState { get; set; }
        public string PackageHash { get; set; }
        public string PackagePath { get; set; }
        public string StagingPath { get; set; }
        public string ManifestJson { get; set; }
        public string LastOperation { get; set; }
        public string LastError { get; set; }
        public bool IsRestartRequired { get; set; }
        public DateTime EnabledOn { get; set; }
        public DateTime DisabledOn { get; set; }
       
        public bool IsBuiltIn { get; set; }
        public bool IsActive { get; set; }

        [AutoFill(false)]
        public bool IsDeleted { get; set; }

        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreUpdate]
        public DateTime AddedOn { get; set; }

        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreUpdate]
        public long AddedBy { get; set; }


        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreUpdate]
        public long DeletedBy { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        public DateTime UpdatedOn { get; set; }
        [AutoFill(AutoFillProperty.CurrentDate)]
        [IgnoreInsert]
        public DateTime DeletedOn { get; set; }

        [AutoFill(AutoFillProperty.CurrentUserId)]
        [IgnoreInsert]
        public long UpdatedBy { get; set; }

        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}
