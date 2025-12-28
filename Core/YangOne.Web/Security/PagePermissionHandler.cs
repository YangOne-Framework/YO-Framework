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






            //var actionProvider = httpContext.RequestServices.GetService<IActionDescriptorCollectionProvider>();
            //var roleallpermissions = await permissionService.GetAllRoleBasedPermissionsAsync();
            //var userAllPermissions = await permissionService.GetAllUserBasedPermissionsAsync();
            //var roleService = httpContext.RequestServices.GetService<IIdentityRoleService>();
            //var cacheServic

        }
    }

    //public class PagePermissionHandler : AuthorizationHandler<PagePermissionRequirement>
    //{
    //    private string _cachingKey = "Kachuwa.Routes";
    //    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PagePermissionRequirement requirement)
    //    {

    //        var userRoles = context.User.Identity.GetRoles();

    //        if (userRoles.Contains(KachuwaRoleNames.SuperAdmin))
    //        {
    //            context.Succeed(requirement);
    //            return;
    //        }
    //        var httpContext = ContextResolver.Context;
    //        var identityRoleServices = httpContext.RequestServices.GetService<IIdentityRoleService>();
    //        var objRole = await identityRoleServices.GetUserRolesAsync(context.User.Identity.GetIdentityUserId());
    //        if (objRole != null && objRole.Count() == 0)
    //        {
    //            return;
    //        }
    //        var permissionService = httpContext.RequestServices.GetService<IPermissionService>();
    //        var list = await permissionService.ListAllRolePermissions();
    //        var getObjRolePermission = list.Where(x => x.RoleId == objRole.FirstOrDefault().Id && x.RouteUrl.ToLower() == httpContext.Request.Path.ToString().ToLower()).FirstOrDefault();
    //        if (getObjRolePermission != null && getObjRolePermission.HavePermission)
    //        {
    //            context.Succeed(requirement);
    //            return;
    //        }
    //        var routeData = httpContext.GetRouteData();
    //        var ax = routeData.Values["action"] != null ? routeData.Values["action"].ToString() : string.Empty;
    //        var ctrl = routeData.Values["controller"] != null ? routeData.Values["controller"].ToString() : string.Empty;
    //        var ara = routeData.Values["area"] != null ? routeData.Values["area"].ToString() : string.Empty;
    //        string url = "/" + ara + "/" + ctrl + "/" + ax;
    //        string defaultroute = "/" + ctrl + "/" + ax;
    //        url = url.ToLower();
    //        var llist = list.Where(X => X.RoleId == objRole.FirstOrDefault().Id).ToList();
    //        for (int i = 0; i < llist.Count(); i++)
    //        {
    //            if (llist[i].RouteUrl.ToLower() == url || llist[i].RouteUrl == url + "/" || llist[i].ActionUrl == url || llist[i].ActionUrl == defaultroute || "/admin" + llist[i].RouteUrl.ToLower() == url)
    //            {
    //                if (llist[i].HavePermission)
    //                {
    //                    context.Succeed(requirement);
    //                    return;
    //                }
    //            }
    //        }
    //        //getObjRolePermission = list.Where(
    //        //    x => x.RoleId == objRole.FirstOrDefault().Id
    //        //&& (x.RouteUrl.ToLower() == url || x.RouteUrl.ToLower() == url + "/" || "/admin" + x.ActionUrl.ToLower() == url)).FirstOrDefault();
    //        //if (getObjRolePermission != null && getObjRolePermission.HavePermission)
    //        //{
    //        //    context.Succeed(requirement);
    //        //    return;
    //        //}

    //        return;






    //        //var actionProvider = httpContext.RequestServices.GetService<IActionDescriptorCollectionProvider>();
    //        //var roleallpermissions = await permissionService.GetAllRoleBasedPermissionsAsync();
    //        //var userAllPermissions = await permissionService.GetAllUserBasedPermissionsAsync();
    //        //var roleService = httpContext.RequestServices.GetService<IIdentityRoleService>();
    //        //var cacheService = httpContext.RequestServices.GetService<ICacheService>();

    //        //var currentUserId = context.User.Identity.GetIdentityUserId();
    //        //var userRoleIds = new List<int>();
    //        //if (userRoles.Any())
    //        //    userRoleIds = await roleService.GetRoleIds(userRoles?.ToArray());
    //        //var rolepermissions = roleallpermissions.Where(x => userRoleIds.Any(z => z == x.RoleId));
    //        //var userPermissions = userAllPermissions.Where(x => x.UserId == currentUserId);
    //        //var routes = await cacheService.GetAsync<IEnumerable<RouteCollectionViewModel>>(_cachingKey, async () =>
    //        //  {
    //        //      return actionProvider.ActionDescriptors.Items.Where(z => z.AttributeRouteInfo != null).Select(y => new
    //        //  RouteCollectionViewModel
    //        //      {
    //        //          Action = y.RouteValues["Action"],
    //        //          Controller = y.RouteValues["Controller"],
    //        //          Area = y.RouteValues["Area"] == null ? "" : y.RouteValues["Area"],
    //        //          Name = y.AttributeRouteInfo.Name,
    //        //          Template = y.AttributeRouteInfo.Template

    //        //      }).ToList();
    //        //  });

    //        //var linkGenerator = ContextResolver.Context.RequestServices.GetService<LinkGenerator>();
    //        ////  _urlHelper = new UrlHelper(actionAccesser.ActionContext);
    //        //var routeData = httpContext.GetRouteData();
    //        //var ax = routeData.Values["action"] != null ? routeData.Values["action"].ToString() : "";
    //        //var ctrl = routeData.Values["controller"] != null ? routeData.Values["controller"].ToString() : "";
    //        //var ara = routeData.Values["area"] != null ? routeData.Values["area"].ToString() : "";
    //        ////route collection will have only route attribute used
    //        //var currentActionDetails = routes.Where(c => c.Action.ToLower() == ax.ToLower() && c.Controller.ToLower() == ctrl.ToLower() && c.Area.ToLower() == ara.ToLower());
    //        //bool hasActionType = false;
    //        //string actionType = "";
    //        //int approveLevel = 0;

    //        //var descriptor = endpoint.Metadata.GetMetadata<ControllerActionDescriptor>();

    //        //var cpA = descriptor.MethodInfo.GetCustomAttribute<CheckPermissionAttribute>();
    //        //if (cpA != null)
    //        //{
    //        //    hasActionType = true;
    //        //    actionType = cpA.ActionType;
    //        //}
    //        //if (currentActionDetails.Any())
    //        //{
    //        //    var templates = currentActionDetails.Select(x => x.Template).ToArray();


    //        //    //checking controller other actions which are sub activities of a page
    //        //    //ie if index has permission then allowing other actions as well
    //        //    if (ax.ToLower() != "index")
    //        //    {
    //        //        var indexRootActionUrl = linkGenerator.GetPathByAction("Index", ctrl, new { area = ara }); //_urlHelper.Action("Index", ctrl, new { area = ara });
    //        //        if (indexRootActionUrl.StartsWith("/"))
    //        //        {
    //        //            indexRootActionUrl = indexRootActionUrl.TrimStart('/');
    //        //        }
    //        //        //removing /page on routed value that used for pagination
    //        //        if (indexRootActionUrl.Contains("/page"))
    //        //        {
    //        //            indexRootActionUrl = indexRootActionUrl.ReplaceLastOccurrence(@"/page", "");
    //        //        }

    //        //        var pagerootPermissions = rolepermissions.Where(p =>
    //        //        {
    //        //            string _url = p.Url;
    //        //            if (_url.StartsWith("/"))
    //        //            {
    //        //                _url = _url.TrimStart('/');
    //        //            }

    //        //            return indexRootActionUrl.Contains(_url, StringComparison.InvariantCultureIgnoreCase);
    //        //        });
    //        //        if (userRoles.Any())
    //        //        {
    //        //            var userrootPagePermision = pagerootPermissions.Where(z => userRoleIds.Contains(z.RoleId));
    //        //            foreach (var p in userrootPagePermision)
    //        //            {
    //        //                //if (p.AllowAccessForAll || p.AllowAccess)
    //        //                //{
    //        //                //    context.Succeed(requirement);
    //        //                //    break;
    //        //                //}
    //        //                if (p.AllowAccessForAll)
    //        //                {
    //        //                    context.Succeed(requirement);
    //        //                    break;
    //        //                }
    //        //            }
    //        //        }
    //        //        else
    //        //        {

    //        //            if (pagerootPermissions.Where(z => z.AllowAccessForAll).Any())
    //        //            {
    //        //                context.Succeed(requirement);
    //        //            }


    //        //        }
    //        //    }

    //        //    var pagePermissions = rolepermissions.Where(p =>
    //        //    {
    //        //        string _url = p.Url;
    //        //        if (_url.StartsWith("/"))
    //        //        {
    //        //            _url = _url.TrimStart('/');
    //        //        }

    //        //        return templates.Contains(_url, StringComparer.CurrentCultureIgnoreCase);
    //        //    });
    //        //    if (userRoles.Any())
    //        //    {
    //        //        var userPagePermision = pagePermissions.Where(z => userRoleIds.Contains(z.RoleId));
    //        //        if (userPagePermision.Any(p => p.AllowAccessForAll))
    //        //        {
    //        //            context.Succeed(requirement);
    //        //        }
    //        //    }
    //        //    else
    //        //    {
    //        //        if (pagePermissions.Where(z => z.AllowAccessForAll).Any())
    //        //        {
    //        //            context.Succeed(requirement);
    //        //        }
    //        //    }
    //        //    //var userPagePermision = pagePermissions.Where(z => userRoles.Contains(z.RoleName, StringComparer.CurrentCultureIgnoreCase));
    //        //    //if (userPagePermision.Any(p => p.AllowAccessForAll || p.AllowAccess))
    //        //    //{
    //        //    //    context.Succeed(requirement);
    //        //    //}
    //        //    //else
    //        //    //{
    //        //    //    context.Fail();
    //        //    //}


    //        //}
    //        //else
    //        //{
    //        //    //if no custom routes are used in controller 
    //        //    //ie:checking default or index route only
    //        //    //no custom routes inside controllers

    //        //    var indexRootActionUrl = $"{ara}/{ctrl}";//_urlHelper.Action("Index", ctrl, new { area = ara });
    //        //    if (indexRootActionUrl.StartsWith("/"))
    //        //    {
    //        //        indexRootActionUrl = indexRootActionUrl.TrimStart('/');
    //        //    }

    //        //    var pagerootPermissions = rolepermissions.Where(p =>
    //        //        p.Url.ToLower() == indexRootActionUrl.ToLower());





    //        //    if (userRoles.Any())
    //        //    {
    //        //        var userrootPagePermision = pagerootPermissions.Where(z => userRoleIds.Contains(z.RoleId));
    //        //        //first if allow to all
    //        //        if (userrootPagePermision.Any(z => z.AllowAccessForAll))
    //        //        {
    //        //            context.Succeed(requirement);
    //        //        }
    //        //        // role based permission
    //        //        if (userrootPagePermision.Any(permission =>
    //        //            {
    //        //                if (actionType == ActionTypes.List)
    //        //                {
    //        //                    if (permission.ListView == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.Edit)
    //        //                {
    //        //                    if (permission.Edit == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.AddNew)
    //        //                {
    //        //                    if (permission.AddNew == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.Delete)
    //        //                {
    //        //                    if (permission.Delete == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.Approve)
    //        //                {
    //        //                    if (permission.ApproveLevel == approveLevel)
    //        //                        return true;

    //        //                }
    //        //                else if (actionType == ActionTypes.ChangeStatus)
    //        //                {
    //        //                    if (permission.ChangeStatus == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.Approve)
    //        //                {
    //        //                    if (permission.ChangeStatus == true) return true;
    //        //                }

    //        //                else if (actionType == ActionTypes.Export)
    //        //                {
    //        //                    if (permission.Export == true) return true;
    //        //                }
    //        //                else if (actionType == ActionTypes.Print)
    //        //                {
    //        //                    if (permission.Print == true) return true;
    //        //                }

    //        //                return false;
    //        //            }))
    //        //        {
    //        //            context.Succeed(requirement);
    //        //        }

    //        //    }
    //        //    else
    //        //    {
    //        //        if (pagerootPermissions.Where(z => z.AllowAccessForAll).Any())
    //        //        {
    //        //            context.Succeed(requirement);
    //        //        }
    //        //    }



    //        //}


    //    }
    //}
}
