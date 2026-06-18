// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;

namespace YangOne.IdentityServer.ViewModel;

/// <summary>
/// Represents a class ApplicationDetailViewModel.
/// </summary>
public class ApplicationDetailViewModel
{
    public string Id { get; set; }
    public string ClientId { get; set; }
    public string DisplayName { get; set; }
    public string ClientSecret { get; set; }
    public string ClientType { get; set; }
    public string ConsentType { get; set; }
    public string RedirectUris { get; set; }
    public string PostLogoutRedirectUris { get; set; }
    public List<string> Permissions { get; set; } = new List<string>();
    public List<string> Requirements { get; set; } = new List<string>();
    public DateTime? CreationDate { get; set; }
    public List<string> GrantTypes { get; set; } = new List<string>();
    public List<string> Scopes { get; set; } = new List<string>();
}
