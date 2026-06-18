// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Theme
{
    /// <summary>
    /// Configuration options for the theme system.
    /// </summary>
    public interface IThemeConfig
    {
        string Directory { get; set; }
        string LayoutName { get; set; }
        IThemeResolver ThemeResolver { get; set; }
    }
}
