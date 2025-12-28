using YangOne.Log;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.DependencyInjection;
using System.Security.Claims;
using YangOne.Configuration;

namespace YangOne.Web
{
    [LogError]
    public class BaseController : Microsoft.AspNetCore.Mvc.Controller
    {
        public readonly ModelService ModelService = new ModelService();
        public readonly YangOneAppConfig AppConfig;
        public BaseController()
        {
            var config = ContextResolver.Context.RequestServices.GetService<IOptionsSnapshot<YangOneAppConfig>>();
            AppConfig = config.Value;

        }
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var _context = HttpContext;
            if (!HttpContext.User.Identity.IsAuthenticated)
            {
                if (!HttpContext.Request.Cookies.ContainsKey("yo_cms_session_i"))
                {

                    var guid = Guid.NewGuid().ToString();

                    CookieOptions option = new CookieOptions
                    {
                        HttpOnly = true,
                        Expires = DateTime.Now.AddMinutes(20)
                    };


                    _context.Response.Cookies.Append("yo_cms_session_i", guid, option);
                }
            }
            base.OnActionExecuting(filterContext);

            if (!AppConfig.IsInstalled)
            {
                filterContext.Result = new RedirectToRouteResult(new RouteValueDictionary(new
                {
                    controller = "Installer",
                    action = "Index"
                }));
            }
        }
        public RedirectResult RedirectToAnother(string url)
        {
            return base.Redirect(url);
        }
        public int GetCompanyId()

        {
            var claim = ((ClaimsIdentity)User.Identity).FindFirst("CompanyId");
            return claim != null ? Convert.ToInt32(claim.Value) : 0;
        }
        public int GetBranchId()
        {
            var claim = ((ClaimsIdentity)User.Identity).FindFirst("BranchId");
            return claim != null ? Convert.ToInt32(claim.Value) : 0;
        }
        public long GetUserId
        {
            get
            {
                long userid = Convert.ToInt64(User.Claims.First(x => x.Type == "IdUid").Value);
                return userid;
            }

        }

        public string GetUserRole
        {
            get
            {
                string role = User.Claims.First(x => x.Type == "role").Value;
                return role;
            }

        }
    }





}
