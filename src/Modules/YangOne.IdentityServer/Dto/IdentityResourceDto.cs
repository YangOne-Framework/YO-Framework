// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

/// <summary>
/// Represents a class IdentityResourceDto.
/// </summary>
public class IdentityResourceDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string DisplayName { get; set; }
    public string Description { get; set; }
}
