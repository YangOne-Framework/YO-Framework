// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.IdentityServer.Dto;

public class PagedResult<T>
{
    public int Offset { get; set; }
    public int Limit { get; set; }
    public int Total { get; set; }
    public List<T> Items { get; set; } = new();
}
