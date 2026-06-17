// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using YangOne.Identity.Extensions;
using Microsoft.AspNetCore.Routing;
using YangOne.Identity.Service;
using YangOne.Identity;

namespace YangOne.Web.Security
{

    public class PagePermissionHandler : AuthorizationHandler<PagePermissionRequirement>
    {
        private string _cachingKey = "YO.Routes";
        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PagePermissionRequirement requirement)
        {

            var userRoles = context.User.Identity.GetRoles();

            if (userRoles.Contains(YORoleNames.SuperAdmin))
            {
                context.Succeed(requirement);
                return;
            }
            var httpContext = ContextResolver.Context;
            var identityRoleServices = httpContext.RequestServices.GetService<IIdentityRoleService>();
            var userRolesAll = await identityRoleServices.GetUserRolesAsync(context.User.Identity.GetIdentityUserId());
            if (userRolesAll != null && !userRolesAll.Any())
            {
                return;
            }
            var permissionService = httpContext.RequestServices.GetService<IPermissionService>();
            var allRolesPermissions = await permissionService.GetAllRolesPermissions();
            var userRolePermission = allRolesPermissions.FirstOrDefault(x => x.RoleId == userRolesAll?.FirstOrDefault().Id && x.RouteUrl.ToLower() == httpContext.Request.Path.ToString().ToLower());
            if (userRolePermission != null && userRolePermission.AllowAccess)
            {
                context.Succeed(requirement);
                return;
            }
            var routeData = httpContext.GetRouteData();
            var ax = routeData.Values["action"] != null ? routeData.Values["action"].ToString() : string.Empty;
            var ctrl = routeData.Values["controller"] != null ? routeData.Values["controller"].ToString() : string.Empty;
            var ara = routeData.Values["area"] != null ? routeData.Values["area"].ToString() : string.Empty;
            string url = "/" + ara + "/" + ctrl + "/" + ax;
            string defaultroute = "/" + ctrl + "/" + ax;
            url = url.ToLower();
            var userRolePermissions = allRolesPermissions.Where(X => X.RoleId == userRolesAll.FirstOrDefault().Id).ToList();
            for (int i = 0; i < userRolePermissions.Count(); i++)
            {
                if (userRolePermissions[i].RouteUrl.ToLower() == url || userRolePermissions[i].RouteUrl == url + "/" || userRolePermissions[i].ActionUrl == url || userRolePermissions[i].ActionUrl == defaultroute || "/admin" + userRolePermissions[i].RouteUrl.ToLower() == url)
                {
                    if (userRolePermissions[i].AllowAccess)
                    {
                        context.Succeed(requirement);
                        return;
                    }
                }
            }          

            return;
        }
    }
   
}

