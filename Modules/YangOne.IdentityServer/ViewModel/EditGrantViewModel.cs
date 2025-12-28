using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YangOne.IdentityServer.ViewModel;

public class EditGrantViewModel
{
    public string Id { get; set; }
    public string Subject { get; set; }
    public string ApplicationName { get; set; }
    public DateTimeOffset? CreationDate { get; set; }

    [Required]
    public string Status { get; set; }

    public List<string> Scopes { get; set; } = new List<string>();
    public List<string> AvailableStatuses { get; set; } = new List<string>();
}