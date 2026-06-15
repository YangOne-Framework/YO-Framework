using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace YangOne.Web
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    public class YOPageAttribute : ActionFilterAttribute
    {
        public YOPageAttribute()
        {

        }

        public string PageUrl { get; private set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var pageUrl = filterContext.RouteData.Values["pageUrl"];

            if (pageUrl != null)
            {
                PageUrl = pageUrl.ToString();
                filterContext.HttpContext.Items.Add("YOPageUrl", PageUrl);
            }
            else
            {//landing home page

                filterContext.HttpContext.Items.Add("YOPageUrl", "landing");
            }

            base.OnActionExecuting(filterContext);
        }

        public override void OnActionExecuted(ActionExecutedContext context)
        {
            PartialViewResult result = null;

            if (context.Result != null && context.Result.GetType() == typeof(PartialViewResult))
            {
                result = context.Result as PartialViewResult;
            }
            if (result != null && result.ViewName == "page-not-found")
            {
                context.HttpContext.Items.Remove("YOPageUrl");
                context.HttpContext.Items.Add("YOPageUrl", "page-not-found");
            }
            base.OnActionExecuted(context);
        }
    }
}