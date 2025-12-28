using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YangOne.Data.Crud.Attribute;
using YangOne.Localization;
using YangOne.Web;
using YangOne.Web.Layout;
using YangOne.Web.Module;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.ViewModels;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class PageController : BaseController
    {
        private readonly IPageService _pageService;
        private readonly IModuleComponentProvider _moduleComponentProvider;
        private readonly ILayoutRenderer _layoutRenderer;
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;

        public PageController(IPageService pageService,
            IModuleComponentProvider moduleComponentProvider,
            ILayoutRenderer layoutRenderer, INotificationService notificationService,ILocaleResourceProvider localeResourceProvider)
        {
            _pageService = pageService;
            _moduleComponentProvider = moduleComponentProvider;
            _layoutRenderer = layoutRenderer;
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;
        }
        #region Page Crud

        [Route("admin/page/page/{pageNo?}")]
        [Route("admin/page")]//default make it at last
        [FriendlyName("Page List")]

        public async Task<IActionResult> Index([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _pageService.CrudService.GetListPagedAsync(pageNo, rowsPerPage, 1,
                "Where Name like @Query and IsDeleted=@IsDeleted", "Addedon desc", new { IsDeleted=false,Query = "%" + query + "%" });
            return View(model);
        }

        [Route("admin/page/new")]
        [FriendlyName("Add New Page")]
        public async Task<IActionResult> New()
        {
            PageViewModel viewModel = new PageViewModel();
            
            return View(viewModel);
        }

        [HttpPost]
        [Route("admin/page/new")]
        [FriendlyName("Save New Page")]
        public async Task<IActionResult> New(PageViewModel model)
        {
            if (ModelState.IsValid)
            {
                model.Url = model.Url.TrimStart(new char[] { '/' });
                if (model.Url.ToLower() == "landing")
                {

                    ModelState.TryAddModelError("Url", "Landing url is default,used by system.");
                    _notificationService.Notify("Warning", "Landing url is default,used by system.",
                        NotificationType.Warning);
                    return View(model);
                }
                if (model.PageId == 0)
                {
                    if (!await _pageService.CheckPageExist(model.Url))
                    {
                        await _pageService.Save(model);
                        _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                    }
                    else
                    {
                        ModelState.AddModelError("", "url is already in use.");
                        _notificationService.Notify("Alert", "Url is already in use.",
                            NotificationType.Warning);
                        return View(model);
                    }

                }
                return RedirectToAction("Index");
            }
            else
            {
                _notificationService.Notify("Warning", "Validation failed.",
                    NotificationType.Warning);
                return View(model);
            }
        }

        [Route("admin/page/config/{pageId}")]
        [FriendlyName("Edit Page Config")]
        public async Task<IActionResult> Config([FromRoute]int pageId)
        {
            var page = await _pageService.CrudService.GetAsync(pageId);
            if (page.IsBackend && page.IsSystem)
            {
                _notificationService.Notify("Alert", "Backend pages are not configurable.", NotificationType.Warning);
                return RedirectToAction("Index");
            }
            var model = await _pageService.CrudService.GetAsync(pageId);
            var moduleComponents = _moduleComponentProvider.GetComponents();
            var moduleList = new List<ModuleViewModel>();
            foreach (var key in moduleComponents.Keys)
            {
                var moduleViewComponents = moduleComponents[key];
                moduleList.Add(new ModuleViewModel()
                {
                    ModuleName = key,
                    ModuleComponents = moduleViewComponents
                });
            }
            ViewData["Modules"] = moduleList;
            if (string.IsNullOrEmpty(model.ContentConfig))
            {
                ViewData["Layout"] = new LayoutContent();
            }
            else
            {
                ViewData["Layout"] = (LayoutContent)JsonConvert.DeserializeObject<LayoutContent>(model.ContentConfig);
            }
            return View(model);
        }
        [HttpPost]
        [Route("admin/page/config")]
        [FriendlyName("Save Page Config")]
        public async Task<JsonResult> Config(LayoutContent model)
        {
            if (ModelState.IsValid)
            {
                await _pageService.SavePageLayout(model);
                _notificationService.Notify("Saved Successfully!", NotificationType.Success);
                return Json(true);
            }
            return Json(false);
        }


        [Route("admin/page/edit/{pageId}")]
        [FriendlyName("Edit Page")]
        public async Task<IActionResult> Edit([FromRoute]int pageId)
        {
            var model = await _pageService.Get(pageId);
            if (model.IsBackend)
            {
                _notificationService.Notify("Alert", "Backed pages are not editable.", NotificationType.Warning);
                return RedirectToAction("Index");
            }
            model.Url = model.Url;
            return View(model);
        }

        [HttpPost]
        [Route("admin/page/edit")]
        [FriendlyName("Edit Page")]
        public async Task<IActionResult> Edit(PageViewModel model)
        {
            if (ModelState.IsValid)
            {
                model.Url = model.Url.TrimStart(new char[] { '/' });
                if (model.Url.ToLower() == "landing")
                {

                    ModelState.TryAddModelError("URL", "Landing url is default,used by system.");
                    _notificationService.Notify("Warning", "Landing url is default,used by system.",
                        NotificationType.Warning);
                    return View(model);
                }
                if (model.PageId != 0)
                {
                    if (model.IsNew == false && model.OldUrl == model.Url)
                    {
                        await _pageService.Save(model);
                        _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                    }
                    else
                    {
                        if (!await _pageService.CheckPageExist(model.Url))
                        {
                            await _pageService.Save(model);
                            _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                        }
                        else
                        {
                            ModelState.TryAddModelError("Url", "url is already in use.");
                            _notificationService.Notify("Alert", "Url is already in use.",
                                NotificationType.Warning);
                            return View(model);
                        }

                    }

                }

                return RedirectToAction("Index");
            }
            else
            {
                return View(model);
            }
        }

        [HttpPost]
        [Route("admin/page/delete")]
        [FriendlyName("Delete Page")]
        public async Task<JsonResult> Delete(int id)
        {
            try
            {
                var pageDetail = await _pageService.CrudService.GetAsync(id);
                if (pageDetail != null)
                {
                    if (pageDetail.IsBackend || pageDetail.IsSystem)
                    {
                        _notificationService.Notify("Warning", "Can't delete system or backend page.!", NotificationType.Warning);
                        return Json(new { code = 403, Message = "Can't delete system or backend page.", Data = false });
                    }
                    var result = await _pageService.DeletePageAsync(id);
                    _notificationService.Notify("Success", "Data deleted successfully!", NotificationType.Success);
                    return Json(new { code = 200, Message = "", Data = result });
                }
                return Json(new { code = 403, Message = "Unable to delete", Data = false });


            }
            catch (Exception e)
            {
                return Json(new { code = 200, Message = e.Message, Data = false });
            }

        }
        [HttpPost]
        [Route("admin/page/makelanding")]
        [FriendlyName("Add New Landing Page")]
        public async Task<JsonResult> MakeLandingPage(int id)
        {
            try
            {
                var result = await _pageService.MakeLandingPage(id);
                _notificationService.Notify("Success", "Updated landing page successfully!", NotificationType.Success);
                return Json(new { code = 200, Message = "", Data = result });
            }
            catch (Exception e)
            {
                return Json(new { code = 200, Message = e.Message, Data = false });
            }

        }
        [HttpGet]
        [Route("admin/page/modulesetting/{name}")]
        [FriendlyName("Module Setting List")]
        public async Task<IActionResult> LoadModuleSetting([FromRoute]string name)
        {
            var moduleComponents = _moduleComponentProvider.GetComponents(name);
            if (moduleComponents.FirstOrDefault().HasSetting)
                return ViewComponent(moduleComponents.FirstOrDefault().ModuleSettingComponent);
            else return Json(false);

        }
        //[HttpGet]
        //[Route("admin/page/pagepermission/{pageId}")]
        //[FriendlyName("Page Permision List")]
        //public async Task<IActionResult> PagePermission([FromRoute] int pageId)
        //{
        //    PageRolePermissionViewModel model = new PageRolePermissionViewModel();
        //    model.PagePermissions = (await _pageService.GetPagePermission(pageId)).ToList();
        //    model.PageId = pageId;
        //    return View(model);
        //}
        //[HttpPost]
        //[Route("admin/page/pagepermission")]
        //[FriendlyName("Update Page Permission")]
        //public async Task<IActionResult> PagePermission(PageRolePermissionViewModel models)
        //{
        //    models.AutoFill();
        //    if (await _pageService.AddUpdatePagePermission(models))
        //    {
        //        _notificationService.Notify("Success", "Page Permission has been successfully updated", NotificationType.Success);
        //        return RedirectToAction("Index");
        //    }
        //    models.PagePermissions = (await _pageService.GetPagePermission(models.PageId)).ToList();
        //    return View(models);
        //}
        #endregion
    }

}