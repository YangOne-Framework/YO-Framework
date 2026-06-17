// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

public class ClientDetailsDto : ClientListItemDto
{
    public List<string> RedirectUris { get; set; } = new();
    public List<string> PostLogoutRedirectUris { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
    public List<string> Requirements { get; set; } = new();
    public List<string> GrantTypes { get; set; } = new(); // derived from permissions
}
