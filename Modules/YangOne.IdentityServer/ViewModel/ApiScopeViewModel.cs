using System.ComponentModel.DataAnnotations;

namespace YangOne.IdentityServer.ViewModel;

public class ApiScopeViewModel
{
    public string Id { get; set; }

    [Required]
    [Display(Name = "Name (without 'api_' prefix)")]
    [RegularExpression("^[a-z][a-z0-9_]*$",
        ErrorMessage = "Only lowercase letters, numbers and underscores are allowed")]
    public string Name { get; set; }

    [Display(Name = "Display Name")]
    public string DisplayName { get; set; }

    [Display(Name = "Description")]
    public string Description { get; set; }
}