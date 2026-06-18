// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.Dto;

/// <summary>
/// Represents a class CreateGrantRequest.
/// </summary>
public class CreateGrantRequest
{
    public string Subject { get; set; } = default!;
    public string Status { get; set; } = OpenIddictConstants.Statuses.Valid;
    public string? ApplicationId { get; set; }
    public List<string> Scopes { get; set; } = new();
}
