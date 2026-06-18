// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

/// <summary>
/// Represents a class ApiScopeDto.
/// </summary>
public class ApiScopeDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;          // without api_ in API surface
    public string DisplayName { get; set; }
    public string Description { get; set; }
}
