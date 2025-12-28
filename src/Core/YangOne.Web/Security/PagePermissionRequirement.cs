using Microsoft.AspNetCore.Authorization;

namespace YangOne.Web.Security
{
    public class PagePermissionRequirement : IAuthorizationRequirement
    {
        public string PageName { get; }
        public string[] PageRoutes { get; }
        public PagePermissionRequirement()
        {
            //PageName = pageName ?? throw new ArgumentNullException(nameof(pageName));
            //PageRoutes = routes ?? throw new ArgumentNullException(nameof(routes));
        }
    }

    //public class ActionTypes
    //{
    //    public const string List = "LIST";
    //    public const string Create = "CREATE";
    //    public const string Edit = "EDIT";
    //    public const string Delete = "DELETE";
    //    public const string Print = "PRINT";
    //    public const string Export = "EXPORT";
    //    public const string Import = "IMPORT";
    //    public const string AddNew = "ADDNEW";
    //    public const string Download = "DOWNLOAD";
    //    public const string Approve = "APPROVE";
    //    public const string ViewReport = "VIEWREPORT";
    //    public const string RunReport = "RUNREPORT";
    //    public const string ChangeStatus = "CHANGESTATUS";
    //}
    //public class CheckPermissionFilter : IAuthorizationFilter
    //{
    //    private  IPermissionService _permissionService;
    //    private readonly ICacheService _cacheService;
    //    private readonly IIdentityRoleService _roleService;
    //    public string Page { get; set; }
    //    public string ActionType { get; set; }

    //    public CheckPermissionFilter(string rootPageUrl, string actionType,IPermissionService permissionService ,ICacheService cacheService,
    //        IIdentityRoleService roleService)
    //    {
    //        _permissionService = permissionService;
    //        _cacheService = cacheService;
    //        _roleService = roleService;
    //        (Page, ActionType) = (rootPageUrl, actionType);
    //    }
    //    public async void OnAuthorization(AuthorizationFilterContext context)
    //    {
           
    //        if (!string.IsNullOrEmpty(this.Page) && !string.IsNullOrEmpty(this.ActionType))
    //        {
    //           var roleAllPermissions=  await _cacheService.GetAsync("Role.Cache", async() => await _permissionService.GetAllRoleBasedPermissionsAsync(), TimeSpan.FromDays(1));
    //           var userAllPermissions = await _cacheService.GetAsync("User.Cache", async () => await _permissionService.GetAllUserBasedPermissionsAsync(), TimeSpan.FromDays(1));
    //           var userRoles= context.HttpContext.User.Identity.GetRoles();
    //           var userId = context.HttpContext.User.Identity.GetIdentityUserId();
    //           var userRoleIds = new List<int>();
    //            if (userRoles.Any())
    //               userRoleIds = await _roleService.GetRoleIds(userRoles?.ToArray());
    //            var rolepermissions = roleAllPermissions.Where(x => userRoleIds.Any(z => z == x.RoleId));
    //            var userPermissions = userAllPermissions.Where(x => x.UserId == userId);

    //            if (userRoles.Any())
    //            {
    //                var userRolePagePermissions = rolepermissions.Where(z => userRoleIds.Contains(z.RoleId));

    //              var userRolePagePermission=  userRolePagePermissions.Where(p =>
    //                {
    //                    string _url = p.Url;
    //                    if (_url.StartsWith("/"))
    //                    {
    //                        _url = _url.TrimStart('/');
    //                    }

    //                    return this.Page.Contains(_url, StringComparison.InvariantCultureIgnoreCase);
    //                });

    //                foreach (var p in userRolePagePermission)
    //                {
    //                    //if (p.AllowAccessForAll || p.AllowAccess)
    //                    //{
    //                    //    context.Succeed(requirement);
    //                    //    break;
    //                    //}
    //                    if (p.AllowAccessForAll)
    //                    {
    //                        context.Result = new StatusCodeResult(StatusCodes.Status200OK);
    //                        break;
    //                    }
    //                }
    //            }

    //           var userpremission= userPermissions.Where(p =>
    //            {
    //                string _url = p.Url;
    //                if (_url.StartsWith("/"))
    //                {
    //                    _url = _url.TrimStart('/');
    //                }

    //                return this.Page.Contains(_url, StringComparison.InvariantCultureIgnoreCase);
    //            });
    //            foreach (var p in userpremission)
    //            {
    //                //if (p.AllowAccessForAll || p.AllowAccess)
    //                //{
    //                //    context.Succeed(requirement);
    //                //    break;
    //                //}
    //                if (p.AllowAccessForAll)
    //                {
    //                    context.Result = new StatusCodeResult(StatusCodes.Status200OK);
    //                    break;
    //                }
    //            }
    //            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
    //        }
    //    }
    //}
    //[AttributeUsage(AttributeTargets.All, Inherited = true, AllowMultiple = false)]
    //public class CheckPermissionAttribute : Attribute
    //{
    //    public string Page { get; set; }
    //    public string ActionType { get; set; }
        
    //    public CheckPermissionAttribute(string rootPageUrl, string actionType)
            
    //    {
    //        (Page, ActionType) = (rootPageUrl, actionType);
            
    //    }
    //}
}
