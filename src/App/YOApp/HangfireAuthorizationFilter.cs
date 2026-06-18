// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Hangfire.Dashboard;

namespace YOApp
{
    public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            var httpContext = context.GetHttpContext();
            return httpContext.User.Identity?.IsAuthenticated == true
                && httpContext.User.IsInRole("Admin");
        }
    }
}
