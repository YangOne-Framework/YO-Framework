using System.ComponentModel.DataAnnotations;

namespace YangOne.IdentityServer.ViewModel;

public class IdentityResourceViewModel
{
    public string Id { get; set; }

    [Required]
    public string Name { get; set; }

    [Display(Name = "Display Name")]
    public string DisplayName { get; set; }

    [Display(Name = "Description")]
    public string Description { get; set; }
}