// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web.Theme
{
    /// <summary>
    /// Default implementation that resolves the theme from route data or configuration.
    /// </summary>
    public class DefaultThemeResolver : IThemeResolver
    {
        public string Resolve(ControllerContext controllerContext, string theme)
        {
            string themeRouteParam = controllerContext.RouteData.Values.ContainsKey("Theme") ? controllerContext.RouteData.Values["Theme"].ToString() : null;

            return themeRouteParam ?? (!string.IsNullOrEmpty(theme) ? theme : "Default");
        }
    }
}
