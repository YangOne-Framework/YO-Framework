using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace YangOne.IdentityServer.ViewModel;

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