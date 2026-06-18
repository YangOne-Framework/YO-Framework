// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YangOne.Identity.Model;

/// <summary>
/// Represents a temporary role assignment detail.
/// </summary>
[Table("TemporaryRoleDetail")]
public class TemporaryRoleDetail
{

    [Key]
    public long Id { get; set; }
    public long RoleId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Narration { get; set; }
}
