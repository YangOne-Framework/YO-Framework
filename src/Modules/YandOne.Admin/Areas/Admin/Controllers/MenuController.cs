using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YandOne.Admin.ViewModel;
using YangOne.Admin.Service;
using YangOne.Data.Crud.Attribute;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Identity.Service;
using YangOne.Localization;
using YangOne.Web;
using YangOne.Web.Model;
using YangOne.Web.Notification;
using YangOne.Web.Security;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
   [Authorize(PolicyConstants.PagePermission)]
    public class MenuController : BaseController
    {
        private readonly IMenuService _menuService;
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly IIdentityRoleService _identityRoleService;

        public MenuController(IMenuService menuService, INotificationService notificationService
        , ILocaleResourceProvider localeResourceProvider,IIdentityRoleService identityRoleService)
        {
            _menuService = menuService;
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;
            _identityRoleService = identityRoleService;
            _localeResourceProvider.LookUpGroupAt("Menu");
        }
        #region Menu Crud
        [Route("admin/menu/page/{pageNo?}")]
        [Route("admin/menu")]//default make it at last
        [FriendlyName("Menu List")]
        public async Task<IActionResult> Index([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _menuService.MenuCrudService.GetListAsync("Where IsBackend=@IsBackend and  Name like @Query and IsDeleted=@IsDeleted order by MenuOrder asc;", new { IsDeleted=false, IsBackend =true, Query = "%" + query + "%" });
            return View(model);
        }
    
        [Route("admin/menu/frontend")]//default make it at last
        [FriendlyName("Menu Front End")]
        public async Task<IActionResult> Frontend([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _menuService.MenuCrudService.GetListAsync("Where  IsBackend=@IsBackend and Name like @Query and IsDeleted=@IsDeleted order by MenuOrder asc;", new { IsDeleted = false, IsBackend =false, Query = "%" + query + "%" });
            return View(model);
        }

        //[Route("admin/menu/new")]
        //public async Task<IActionResult> New()
        //{

        //    return View();
        //}

        //[HttpPost]
        //[Route("admin/menu/new")]
        //public async Task<IActionResult> New(Menu model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        // model.Url = model.Url.TrimStart(new char[] { '/' });
        //        model.AutoFill();
        //        if (model.MenuId == 0)
        //            await _menuService.MenuCrudService.InsertAsync<int>(model);
        //        else
        //            await _menuService.MenuCrudService.UpdateAsync(model);
        //        return RedirectToAction("Index");
        //    }
        //    else
        //    {
        //        return View(model);
        //    }
        //}


        //[Route("admin/menu/edit/{pageId}")]
        //public async Task<IActionResult> Edit([FromRoute]int pageId)
        //{
        //    var model = await _menuService.MenuCrudService.GetAsync(pageId);
        //    return View(model);
        //}

        //[HttpPost]
        //[Route("admin/menu/edit")]
        //public async Task<IActionResult> Edit(Menu model)
        //{
        //    if (ModelState.IsValid)
        //    {
        //        model.AutoFill();
        //        if (model.MenuId == 0)
        //            await _menuService.MenuCrudService.InsertAsync<int>(model);
        //        else
        //            await _menuService.MenuCrudService.UpdateAsync(model);
        //        return RedirectToAction("Index");
        //    }
        //    else
        //    {
        //        return View(model);
        //    }
        //}

        [HttpPost]
        [Route("admin/menu/delete")]
        [FriendlyName("Delete Menu")]
        public async Task<JsonResult> Delete(int id)
        {
            var result = await _menuService.MenuCrudService.DeleteAsync(id);
            await _menuService.PermissionCrudService.DeleteAsync("Where MenuId=@MenuId", new { MenuId = id });
            return Json(result);
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/get")]
        [FriendlyName("Menu Details")]
        public async Task<JsonResult> GetMenu(int id)
        {
            var result = await _menuService.MenuCrudService.GetAsync("Where MenuId=@MenuId", new {MenuId = id});
            var permissions =
                await _menuService.PermissionCrudService.GetListAsync("Where MenuId=@MenuId", new { MenuId = id });
            var model = result.To<MenuViewModel>();
            model.Permissions = permissions.ToList();
            return Json(model);
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/save")]
        [FriendlyName("Save New Menu")]
        public async Task<JsonResult> SaveMenu(MenuViewModel model)
        {
            var status = await _menuService.SaveMenu(model);
            return Json(status > 0);
        }
        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/sort/save")]
        [FriendlyName("Sort Menu")]
        public async Task<JsonResult> SortMenu(List<MenuOrderViewModel> model)
        {
            var status = await _menuService.SaveMenuOrder(model);
            return Json(status);
        }
        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/order/save")]
        [FriendlyName("Save New Menu Order")]
        public async Task<JsonResult> SaveMenuOrder(List<MenuOrderViewModel> orders)
        {
            var status = await _menuService.SaveMenuOrder(orders);
            return Json(status);
        }
        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/roles")]
        [FriendlyName("Menu Roles List")]
        public async Task<JsonResult> GetRoles( )
        {
            var roles = await _identityRoleService.RoleService.GetListAsync();
            var _roles = roles.Select(x => new { Id = x.Id, Name = x.Name });
            return Json(new {Code = 200, Data = _roles, Message = "Success"});
        }
        [HttpPost]
        [AllowAnonymous]
        [Route("admin/menu/groups")]
        [FriendlyName("Save New Menu Groups")]
        public async Task<JsonResult> GetGroups()
        {
            var groups = await _menuService.GroupCrudService.GetListAsync("Where IsActive=@IsActive",new{ IsActive =true});
            return Json(groups);
        }
        #endregion


        #region Menu group Crud
        [Route("admin/menu/group/page/{page?}")]
        [Route("admin/menu/group")]//default make it at last
        [FriendlyName("Menu Group List")]
        public async Task<IActionResult> GroupIndex([FromRoute]int page = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = page;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _menuService.GroupCrudService.GetListPagedAsync(page, rowsPerPage, 1,
                "Where Name like @Query and IsDeleted=0", "Addedon desc", new { Query = "%" + query + "%" });
            return View(model);
        }

        [Route("admin/menu/group/new")]
        [FriendlyName("Add New Menu Group")]
        public async Task<IActionResult> GroupNew()
        {

            return View();
        }

        [HttpPost]
        [Route("admin/menu/group/new")]
        [FriendlyName("Save New Menu Group")]
        public async Task<IActionResult> GroupNew(MenuGroup model)
        {
            if (ModelState.IsValid)
            {
                // model.Url = model.Url.TrimStart(new char[] { '/' });
                model.AutoFill();
                if (model.MenuGroupId == 0)
                    await _menuService.GroupCrudService.InsertAsync<int>(model);
                else
                    await _menuService.GroupCrudService.UpdateAsync(model);
                return RedirectToAction("GroupIndex");
            }
            else
            {
                return View(model);
            }
        }


        [Route("admin/menu/group/edit/{groupId}")]
        [FriendlyName("Edit Menu Group")]
        public async Task<IActionResult> GroupEdit([FromRoute]int groupId)
        {
            var model = await _menuService.GroupCrudService.GetAsync(groupId);
            return View(model);
        }

        [HttpPost]
        [Route("admin/menu/group/edit")]
        [FriendlyName("Save Menu Group")]
        public async Task<IActionResult> TypeEdit(MenuGroup model)
        {
            if (ModelState.IsValid)
            {
                model.AutoFill();
                if (model.MenuGroupId == 0)
                    await _menuService.GroupCrudService.InsertAsync<int>(model);
                else
                    await _menuService.GroupCrudService.UpdateAsync(model);
                return RedirectToAction("GroupIndex");
            }
            else
            {
                return View(model);
            }
        }

        [HttpPost]
        [Route("admin/menu/group/delete")]
        [FriendlyName("Delete Menu Group")]
        public async Task<JsonResult> GroupDelete(int id)
        {
            var result = await _menuService.GroupCrudService.DeleteAsync(id);
            return Json(result);
        }
        #endregion




    }
}