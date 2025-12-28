using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web.Theme
{
    public interface IThemeResolver
    {
        string Resolve(ControllerContext controllerContext, string theme);
    }
}