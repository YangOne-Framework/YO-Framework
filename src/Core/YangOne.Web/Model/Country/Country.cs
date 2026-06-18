// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using YangOne.Data.Crud.Attribute;

namespace YangOne.Web.Model
{
    [Table("Country")]
    /// <summary>
    /// Represents a country with ISO codes, name, currency and phone code information.
    /// </summary>
    public class Country
    {
        [Key]
        public int CountryId { get; set; }

        [Required(ErrorMessage = "Country.Iso.Required")]
        [MaxLength(2,ErrorMessage = "Country.TwoLetterOnly")]
        public string ISO { get; set; }

        [Required(ErrorMessage = "Country.Name.Required")]
        public string Name { get; set; }

        public string NiceName { get; set; }

        public string LocaleName { get; set; }
        [MaxLength(3, ErrorMessage = "Country.ThreeLetterOnly")]
        public string ISO3 { get; set; }

        public short Numcode { get; set; }

        public int PhoneCode { get; set; }

        public string CurrencySymbol { get; set; }

        public string CurrencyCode { get; set; }

        public string Currency { get; set; }
        [IgnoreAll]
        public int RowTotal { get; set; }
    }
}

