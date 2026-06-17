// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using OpenIddict.Abstractions;

namespace YangOne.IdentityServer.Dto;

public class UpdateGrantRequest
{
    public string Status { get; set; } = OpenIddictConstants.Statuses.Valid;
    public string Id { get; set; }
}
