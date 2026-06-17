// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Theme
{
    public class ThemeConfiguration : IThemeConfig
    {
        public ThemeConfiguration()
        {
            LayoutName = "_Layout";
            Directory = "Themes";
            ThemeResolver = new DefaultThemeResolver();
        }
        public string Directory { get; set; }
        public string LayoutName { get; set; }
        public IThemeResolver ThemeResolver { get; set; }
    }
}
