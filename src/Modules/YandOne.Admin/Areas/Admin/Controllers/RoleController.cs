using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using YangOne.Data.Crud.Attribute;
using YangOne.Data.Extension;
using YangOne.Identity.Service;
using YangOne.Localization;
using YangOne.Web;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.ViewModels;
using IdentityRole=YangOne.Identity.Model.IdentityRole;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class RoleController : BaseController
    {
        private readonly INotificationService _notificationService;
        private readonly IIdentityRoleService _identityRoleService;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        public RoleController(INotificationService notificationService,
            IIdentityRoleService identityRoleService,
            RoleManager<IdentityRole> roleManager, ILocaleResourceProvider localeResourceProvider)
        {
            _notificationService = notificationService;
            _identityRoleService = identityRoleService;
            _roleManager = roleManager;
            _localeResourceProvider = localeResourceProvider;
            _localeResourceProvider.LookUpGroupAt("Role");
        }

        #region Role Crud
        [Route("admin/role/page/{pageNo?}")]
        [Route("admin/role")]//default make it at last
        [FriendlyName("Role List")]
        public async Task<IActionResult> Index([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _identityRoleService.RoleService.GetListPagedAsync(pageNo, rowsPerPage, 1,
                "Where Name like @Query", "Name asc", new { Query = "%" + query + "%" });
            return View(model);
        }

        [Route("admin/role/new")]
        [FriendlyName("Add New Role")]
        public async Task<IActionResult> New()
        {

            return View();
        }


        [HttpPost]
        [Route("admin/role/new")]
        [FriendlyName("Save New Role")]
        public async Task<IActionResult> New(IdentityRole model)
        {
            if (ModelState.IsValid)
            {
                if (model.Id == 0)
                {
                    model.AutoFill();
                    if (await _identityRoleService.CheckNameExist(model.Name))
                    {
                        _notificationService.Notify(_localeResourceProvider.Get("Info"), _localeResourceProvider.Get("Role.AlreadyExist"), NotificationType.Info);
                        return View(model);
                    }
                    var status = await _identityRoleService.RoleService.InsertAsync<int>(model);
                    _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data has been saved successfully!"), NotificationType.Success);
                    return RedirectToAction("Index");

                }
                return RedirectToAction("Index");
            }
            else
            {
                var d = ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList();
                _notificationService.Notify(_localeResourceProvider.Get("Validation"), string.Join(',', d), NotificationType.Error);

                return View(model);
            }
        }

        [Route("admin/role/edit/{roleId}")]
        [FriendlyName("Edit Role")]
        public async Task<IActionResult> Edit([FromRoute]int roleId)
        {
            var role = await _identityRoleService.RoleService.GetAsync(roleId);
            if (role.IsSystem)
            {
                _notificationService.Notify(_localeResourceProvider.Get("Warning"),
                    _localeResourceProvider.Get("System roles are uneditable!"), NotificationType.Warning);
                return RedirectToAction("Index");
            }

            var model = new RoleEditViewModel
            {
                Id = role.Id,
                Name = role.Name,
                OldName = role.Name,
                IsSystem = role.IsSystem
            };
        
            return View(model);
        }

        [HttpPost]
        [Route("admin/role/edit")]
        [FriendlyName("Save Role")]
        public async Task<IActionResult> Edit(IdentityRole model,string oldName)
        {
            if (ModelState.IsValid)
            {
                if (model.Id != 0)
                {
                    model.AutoFill();
                    if (model.Name.ToLower() != oldName.ToLower())
                    {
                        if (await _identityRoleService.CheckNameExist(model.Name))
                        {
                            _notificationService.Notify(_localeResourceProvider.Get("Info"), _localeResourceProvider.Get("Role.AlreadyExist"), NotificationType.Info);
                            return View(model);
                        }
                    }
                    var status = await _identityRoleService.RoleService.UpdateAsync(model);
                    _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data has been saved successfully!"),
                        NotificationType.Success);
                    return RedirectToAction("Index");
                }
                return View(model);
            }
            else
            {
                var d = ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList();
                _notificationService.Notify(_localeResourceProvider.Get("Validation"), string.Join(',', d), NotificationType.Error);

                return View(model);
            }
        }

        [HttpPost]
        [Route("admin/role/delete")]
        [FriendlyName("Delete Role")]
        public async Task<JsonResult> Delete(int id)
        {
            try
            {
                var model = await _identityRoleService.RoleService.GetAsync(id);
                if (model.IsSystem)
                {
                    _notificationService.Notify(_localeResourceProvider.Get("Warning"),
                        _localeResourceProvider.Get("System roles are undeletable!"), NotificationType.Warning);
                    return Json(new { code = 403, Message = "", Data = false });
                }
                var result = await _identityRoleService.RoleService.DeleteAsync(id);
                _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data deleted successfully!"), NotificationType.Success);
                return Json(new { code = 200, Message = "", Data = result });
            }
            catch (Exception e)
            {
                return Json(new { code = 200, Message = e.Message, Data = false });
            }

        }

        #endregion

    }
}