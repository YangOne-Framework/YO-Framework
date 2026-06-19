using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using YangOne.Identity.Service;
using YangOne.Web.Service;

namespace YangOne.Web;

/// <summary>
/// Controller for rendering dynamic pages and managing language/culture settings.
/// </summary>
public class YOPageController : BaseController
{
    public readonly IPermissionService permissionService;
    public readonly IPageService PageService;
    private readonly IActionDescriptorCollectionProvider actionDescriptorCollectionProvider;
    private readonly IIdentityRoleService identityRoleService;

    public YOPageController(IPageService pageService,
        IPermissionService permissionService,
        IIdentityRoleService identityRoleService,
        IActionDescriptorCollectionProvider actionDescriptorCollectionProvider)
    {
        this.permissionService = permissionService;
        this.PageService = pageService;
        this.identityRoleService = identityRoleService;
        this.actionDescriptorCollectionProvider = actionDescriptorCollectionProvider;
    }

    [YOPage]
    public async Task<IActionResult> Index(string pageUrl = "")
    {
        if (string.IsNullOrEmpty(pageUrl) || "access-denied" == pageUrl || pageUrl == "page-not-found")
        {
            return View();
        }
        else if (await PageService.CheckPageExist(pageUrl))
        {
            return View();
        }
        return Redirect("/page-not-found");
    }
    [HttpPost("set/language")]
    public IActionResult SetLanguage(string culture, string returnUrl = "/")
    {

        CookieOptions option = new CookieOptions
        {
            HttpOnly = false,
            SameSite = SameSiteMode.Lax,
            IsEssential = true,
            Expires = DateTimeOffset.UtcNow.AddYears(1)
        };
        ControllerContext.HttpContext.Response.Cookies.Append(CookieRequestCultureProvider.DefaultCookieName, CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)), option);
        return LocalRedirect(returnUrl);
    }


}