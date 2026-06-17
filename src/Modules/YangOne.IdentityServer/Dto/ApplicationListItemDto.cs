// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

public class ApplicationListItemDto
{
    public string Id { get; set; } = default!;
    public string ClientId { get; set; } = default!;
    public string DisplayName { get; set; }
    public string ClientType { get; set; }
    public string ConsentType { get; set; }
    public int RowTotal { get; set; }
}
