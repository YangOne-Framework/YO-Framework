// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace YangOne.Web.Model;
[Table("TimeZone")]
/// <summary>
/// Represents a time zone with identifier, display name and UTC offset information.
/// </summary>
public class Timezone
{
    [Key]
    public int Id { get; set; }
    public string Identifier { get; set; }
    public string StandardName { get; set; }
    public string DisplayName { get; set; }
    public string DaylightName { get; set; }
    public bool SupportsDaylightSavingTime { get; set; }
    public int BaseUtcOffsetSec { get; set; }
    public string UTC { get; set; }
}
