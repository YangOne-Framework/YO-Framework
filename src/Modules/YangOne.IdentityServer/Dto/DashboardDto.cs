// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

/// <summary>
/// Represents a class DashboardDto.
/// </summary>
public class DashboardDto
{
    public int ApplicationCount { get; set; }
    public int ScopeCount { get; set; }
    public int TokenCount { get; set; }
    public int AuthorizationCount { get; set; }
}
