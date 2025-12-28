using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web.Theme
{
    public class DefaultThemeResolver : IThemeResolver
    {
        public string Resolve(ControllerContext controllerContext, string theme)
        {
            string themeRouteParam = controllerContext.RouteData.Values.ContainsKey("Theme") ? controllerContext.RouteData.Values["Theme"].ToString() : null;

            return themeRouteParam ?? (!string.IsNullOrEmpty(theme) ? theme : "Default");
        }
    }
}