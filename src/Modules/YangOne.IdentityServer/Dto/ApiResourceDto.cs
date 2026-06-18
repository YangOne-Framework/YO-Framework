// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.ComponentModel.DataAnnotations;

namespace YangOne.IdentityServer.Dto;

/// <summary>
/// Represents a class ApiResourceDto.
/// </summary>
public class ApiResourceDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;          // without rs_ in API surface
    public string DisplayName { get; set; }
    public string Description { get; set; }
}

/// <summary>
/// Represents a class AuthorizeViewModel.
/// </summary>
public class AuthorizeViewModel
{
    [Display(Name = "Application")]
    public string ApplicationName { get; set; }

    [Display(Name = "Scope")]
    public string Scope { get; set; }
}
