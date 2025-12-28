using System.ComponentModel.DataAnnotations;

namespace YangOne.IdentityServer.Dto;

public class ApiResourceDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;          // without rs_ in API surface
    public string DisplayName { get; set; }
    public string Description { get; set; }
}

public class AuthorizeViewModel
{
    [Display(Name = "Application")]
    public string ApplicationName { get; set; }

    [Display(Name = "Scope")]
    public string Scope { get; set; }
}