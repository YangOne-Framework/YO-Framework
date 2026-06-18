// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;
using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Localization
{

    /// <summary>
    /// Represents a localized resource string.
    /// </summary>
    [Table("LocaleResource")]
    public class LocaleResource:YangOne.Localization.LocaleResource
    {
        [Key]
        public int LocaleResourceId { get; set; }
        [Required(ErrorMessage = "Localization.Resource.Name.Required")]
        public  string Name { get; set; }
        public string Value { get; set; }

        [Required(ErrorMessage = "Localization.Resource.Culture.Required")]
        public string Culture { get; set; }
        public string GroupName { get; set; } = "";

        [IgnoreAll]
        public int RowTotal { get; set; }


    }

    /// <summary>
    /// Model for exporting locale resources.
    /// </summary>
    public class LocaleResourcesExportModel
    {
        public string CountryName { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
     
        public string Culture { get; set; }
        public string GroupName { get; set; } = "";
    }
    /// <summary>
    /// Model for importing locale resources.
    /// </summary>
    public class LocaleResourcesImportModel
    {  public string CountryName { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }

        public string Culture { get; set; }
        public string GroupName { get; set; } = "";
      
    }

    /// <summary>
    /// View model for importing locale resource files.
    /// </summary>
    public class LocaleResourcesImportViewModel
    {
        public IFormFile ImportFile { get; set; }
    }

    /// <summary>
    /// Represents the result of a locale resource import operation.
    /// </summary>
    public class ImportedStatus
    {
        public bool IsImported { get; set; }
        public string Error { get; set; }
        public bool HasError { get; set; }
    }
}
