// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Localization;

/// <summary>
/// Represents a single localized string resource.
/// </summary>
public class LocaleResource
{
       
    public string Name { get; set; }
    public string Value { get; set; }
    public string Culture { get; set; }
    public string GroupName { get; set; } = "";


}
