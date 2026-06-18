// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc.ViewComponents;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Defines metadata for a module view component.
    /// </summary>
    public interface IModuleComponentDescription
    {
        ViewComponentDescriptor ComponentDescriptor { get; set; }
        string DisplayName { get; set; }
        string FullName { get; set; }
        bool IsVisibleOnUI { get; set; }
        string ShortName { get; set; }
    }
}
