// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Security;

public class CspConfig
{
    public Dictionary<string, List<string>> Directives { get; set; } = new();
    public bool SupportNonce { get; set; }
}
