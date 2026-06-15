using System.Data;
using System.Data.Common;
using System.Reflection;
using Dapper;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.Extensions.Configuration;
using YangOne.Caching;
using YangOne.Data;
using YangOne.Data.Crud.Attribute;
using YangOne.Data.Extension;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public class PermissionService : IPermissionService
    {
        private string _cacheKey = "YO.PagePermissionExtended";
        public CrudService<ApplicationController> AppControllerCrudService { get; set; } = new CrudService<ApplicationController>();
        public CrudService<ApplicationControllerAction> ApplicationControllerActionCrudService { get; set; } = new CrudService<ApplicationControllerAction>();
        public CrudService<MasterRolePermission> RolePermissionCrudService { get; set; } = new CrudService<MasterRolePermission>();
        public CrudService<UserPermission> UserPermissionCrudService { get; set; } = new CrudService<UserPermission>();

        private readonly IConfiguration _configuration;
        private readonly ICacheService _cacheService;
        private readonly IActionDescriptorCollectionProvider _actionDescriptorCollectionProvider;

        public PermissionService(IConfiguration configuration,
            ICacheService cacheService,
            IActionDescriptorCollectionProvider actionDescriptorCollectionProvider)
        {
            _configuration = configuration;
            _cacheService = cacheService;
            _actionDescriptorCollectionProvider = actionDescriptorCollectionProvider;
        }

        public async Task DeleteRolePermissions(int roleId, long deletedBy)
        {
            await RolePermissionCrudService.UpdateAsDeleted("Where RoleId=@RoleId", new { DeletedBy = deletedBy, RoleId = roleId });
        }

        public async Task<IEnumerable<ApplicationController>> SaveApplicationControllers(List<ApplicationController> appControllers)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                foreach (var item in appControllers)
                {

                    await db.ExecuteAsync(@"If NOT EXISTS(Select 1 From dbo.ApplicationController WHERE Name=@Name)
BEGIN
INSERT INTO dbo.ApplicationController (Name) VALUES (@Name);
END",
                        item);
                }

                return await db.QueryAsync<ApplicationController>(@"select * from dbo.ApplicationController");

            }
        }
        public async Task<bool> SaveApplicationControllerActions(List<ApplicationControllerAction> actions)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                foreach (var item in actions)
                {
                    await db.ExecuteAsync(
                        @"If NOT EXISTS(Select 1 From dbo.ApplicationControllerAction WHERE RouteUrl=@RouteUrl)
BEGIN
INSERT INTO dbo.ApplicationControllerAction (ApplicationControllerId,ActionUrl,RouteUrl,FriendlyName) VALUES (@ApplicationControllerId,@ActionUrl,@RouteUrl,@FriendlyName)
END
ELSE
BEGIN
UPDATE dbo.ApplicationControllerAction set 
		FriendlyName=@FriendlyName,
		ActionUrl=@ActionUrl
		Where RouteUrl=@RouteUrl
END",
                        item);
                }

                return true;
            }
        }

        public async Task<IEnumerable<MasterRolePermission>> GetRolePermissionsById(int RoleId)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<MasterRolePermission>("[dbo].[usp_RolePermission_GetByRoleId]",
                    new { RoleId = RoleId },
                    commandType: CommandType.StoredProcedure);
            }
        }
        public async Task<IEnumerable<MasterRolePermission>> GetAllRolesPermissions()
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryAsync<MasterRolePermission>("[dbo].[usp_RolePermission_GetAll]", commandType: CommandType.StoredProcedure);
            }
        }
        public async Task SaveRolePermissions(RolePermissionViewModel rolePermissions)
        {

            await RolePermissionCrudService.DeleteAsync("Where RoleId=@RoleId", new { RoleId = rolePermissions.RolePermission.FirstOrDefault().RoleId });
            foreach (var item in rolePermissions.RolePermission)
            {
                if (item.HavePermission)
                {
                    item.AutoFill();
                    item.RoleId = rolePermissions.RolePermission[0].RoleId;
                    //item.IsActive = true;
                    await RolePermissionCrudService.InsertAsync(item);
                }
            }


        }       

        public async Task InitializeAsync()
        {
            if(_configuration["YangOneAppConfig:IsInstalled"]?.ToLower()=="false")
                return ;
            var routes = _actionDescriptorCollectionProvider.ActionDescriptors.Items.
                 Where(z => z.AttributeRouteInfo != null).Select(x =>
                 {
                     var cc = ((Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor)x).MethodInfo.GetCustomAttribute<FriendlyNameAttribute>();
                     string fn = cc == null ? "" : cc.Template;
                     return new
                     {
                         FriendlyName = fn,
                         RouteUrl = x.AttributeRouteInfo,
                         Action = x.RouteValues["Action"],
                         Controller = x.RouteValues["Controller"]
                     };
                 }).ToList();
            List<ApplicationController> lstAppCountroller = new List<ApplicationController>();
            foreach (var item in routes.GroupBy(x => x.Controller))
            {
                ApplicationController controller = await AppControllerCrudService.GetAsync("Where Name=@name", new { name = item.Key });

                if (controller == null)
                {
                    controller = new ApplicationController()
                    {
                        Name = item.Key,
                    };
                }
                lstAppCountroller.Add(controller);
            }

            var newAppControllers = await SaveApplicationControllers(lstAppCountroller);
            List<ApplicationControllerAction> actions = new List<ApplicationControllerAction>();
            string[] igonerroute = new string[] { "RedirectToAnother", "GetCompanyId", "GetBranchId" };
            foreach (var item in newAppControllers)
            {
                foreach (var r in routes.Where(x => x.Controller == item.Name))
                {
                    if (!igonerroute.Contains(r.Action))
                    {
                        ApplicationControllerAction objAppControllerUrl = new()
                        {
                            ApplicationControllerId = item.ApplicationControllerId,
                            ActionUrl = $"/{r.Controller}/{r.Action}",

                        };
                        if (r.FriendlyName != null)
                        {
                            objAppControllerUrl.FriendlyName = $"{r.FriendlyName}";
                        }
                        if (r.RouteUrl != null)
                        {
                            objAppControllerUrl.RouteUrl = $"/{r.RouteUrl.Template}";
                            if (objAppControllerUrl.RouteUrl.Contains("{"))
                            {
                                objAppControllerUrl.RouteUrl = objAppControllerUrl.RouteUrl.Split("{")[0];
                            }
                        }
                        if (!r.RouteUrl.Template.Contains(" "))
                        {
                            actions.Add(objAppControllerUrl);

                            //await permissionService.UpdateInsertAppControllerUrl(objAppControllerUrl);
                        }

                    }

                }
            }
            await SaveApplicationControllerActions(actions);
        }

        public async Task<IEnumerable<UserPermission>> GetUserPermissionsById(long userId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var results = (await db.QueryAsync<UserPermission>("[dbo].[usp_UserPermission_GetByUserId]",
                    new { UserId = userId },
                    commandType: CommandType.StoredProcedure)).ToList();

                var isSuperAdmin = await db.QueryFirstOrDefaultAsync<bool>(
                    @"SELECT CAST(CASE WHEN EXISTS (
                        SELECT 1 FROM dbo.IdentityUserRole ur
                        INNER JOIN dbo.IdentityRole r ON r.Id = ur.RoleId
                        WHERE ur.UserId = @UserId AND r.Name = 'SuperAdmin'
                    ) THEN 1 ELSE 0 END AS BIT)",
                    new { UserId = userId });

                if (isSuperAdmin)
                {
                    foreach (var p in results)
                    {
                        p.RoleAllowAccess = true;
                        p.EffectiveAccess = true;
                    }
                }

                return results;
            }
        }

        public async Task<IEnumerable<string>> GetMyPermissions(long userId)
        {
            var all = await GetUserPermissionsById(userId);
            return all
                .Where(p => p.EffectiveAccess)
                .Select(p => p.RouteUrl)
                .Distinct()
                .ToList();
        }

        public async Task SaveUserPermissions(UserPermissionViewModel userPermissions)
        {
            if (userPermissions?.UserPermission == null || !userPermissions.UserPermission.Any())
                return;

            var userId = userPermissions.UserPermission.First().UserId;
            await UserPermissionCrudService.DeleteAsync("Where UserId=@UserId", new { UserId = userId });

            foreach (var item in userPermissions.UserPermission)
            {
                if (item.HasUserOverride)
                {
                    item.AutoFill();
                    item.UserId = userId;
                    item.AllowAccess = item.UserOverrideAccess;
                    item.IsActive = true;
                    await UserPermissionCrudService.InsertAsync(item);
                }
            }
        }

        public async  Task CleanupAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(@"truncate table dbo.ApplicationControllerAction;
truncate table dbo.ApplicationController");
            }
        }
    }
}
