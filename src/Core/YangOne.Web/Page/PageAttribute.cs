// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace YangOne.Web
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
    /// <summary>
    /// Action filter attribute that captures the page URL from route data and adds it to the HTTP context items.
    /// </summary>
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
