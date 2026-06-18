// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace YangOne.IdentityServer.ViewModel;

/// <summary>
/// Represents a class CreateGrantViewModel.
/// </summary>
public class CreateGrantViewModel
{
    [Required]
    public string Subject { get; set; }

    [Display(Name = "Application")]
    public string ApplicationId { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    [Display(Name = "Scopes")]
    public List<string> Scopes { get; set; } = new List<string>();

    public List<SelectListItem> AvailableApplications { get; set; }
    public List<string> AvailableStatuses { get; set; }
    public List<string> AvailableScopes { get; set; }
}
