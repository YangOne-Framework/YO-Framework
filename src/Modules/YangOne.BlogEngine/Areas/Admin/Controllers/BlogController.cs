using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.BlogEngine;
using YangOne.BlogEngine.Model;
using YangOne.BlogEngine.Service;
using YangOne.BlogEngine.ViewModel;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Localization;
using YangOne.Storage;
using YangOne.Web.Form;
using YangOne.Web.Model;
using YangOne.Web.Module;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.Service;

namespace YangOne.HtmlContent.Controllers
{
    [Area("Admin")] 
    [Authorize(PolicyConstants.PagePermission)]
    public class BlogController : YangOneModuleController<BlogModule>
    {
        private readonly IBlogService _blogService;
        private readonly ISettingService _settingService;
        private readonly INotificationService _notificationService;
        private readonly IStorageProvider _storageProvider;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly Setting _webSetting;


        public BlogController(IBlogService blogService, ISettingService settingService
        , INotificationService notificationService, IStorageProvider storageProvider, ILocaleResourceProvider localeResourceProvider
       )
        {
            _blogService = blogService;
            _settingService = settingService;
            _notificationService = notificationService;
            _storageProvider = storageProvider;
            _localeResourceProvider = localeResourceProvider;
            _webSetting = _settingService.CrudService.Get(1);
        }

        #region Blog Crud

        [Route("admin/blog/post/page/{pageNo?}")]
        [Route("admin/blog/post")]
        public async Task<IActionResult> Index([FromRoute]int pageNo = 1, [FromQuery]string query = "", int cid = 0)
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            ViewBag.CategoryId = cid;
            ViewBag.Query = query;
            //customized viewmodel with join
            var categories = await _blogService.CategoryService.GetListAsync("Where IsActive=@IsActive", new { IsActive = true });
            ViewData["Categories"] = categories;
            var model = await _blogService.PostCrudService.GetListPagedAsync(pageNo, rowsPerPage, 1,
                "Where Title like @Query and (Categories=@Categories OR @Categories=0) and IsDeleted=0", "Addedon desc", new { Categories= cid, Query = "%" + query + "%" });
            return View(model);
        }


        private async Task LoadFormDataSource(int categoryId = 0)
        {
            var categories = await _blogService.CategoryService.GetListAsync("Where IsActive=@IsActive", new { IsActive = true });
            var fd = new FormDatasource();
            fd.SetSource("Categories", categories.Select(e => new FormInputItem()
            {
                IsSelected = e.PostCategoryId == categoryId,
                Id = e.PostCategoryId,
                Label = e.Name,
                Value = e.PostCategoryId.ToString()
            }));

            ViewData["FormDataSource"] = fd;
        }
        [Route("admin/blog/post/new")]
        public async Task<IActionResult> New()
        {
            await LoadFormDataSource();
            return View();
        }

        [HttpPost]
        [Route("admin/blog/post/new")]
        public async Task<IActionResult> New(SavePostViewModel model)
        {
            if (ModelState.IsValid)
            {

                model.AutoFill();
                model.Url = model.Url.TrimStart(new char[] { '/' });
                model.PostAuthorId = User.Identity.GetIdentityUserId();
                if (!await _blogService.CheckUrlExists(model.Url))
                {
                    if (model.ThumbnailImageFile != null)
                    {
                        //model.ThumbnailImage = await _storageProvider.Save("blog", model.ThumbnailImageFile);
                        model.ThumbnailImage = await _storageProvider.Save(model.ThumbnailImageFile);
                    }
                    if (model.CoverImageFile != null)
                    {
                       // model.CoverImage = await _storageProvider.Save("blog", model.CoverImageFile);
                        model.CoverImage = await _storageProvider.Save(model.CoverImageFile);
                    }
                    await _blogService.SavePost(model);
                    _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                    return RedirectToAction("Index");
                }
                else
                {
                    ModelState.AddModelError("", "url is already in use.");
                    _notificationService.Notify("Alert", "Url is already in use.",
                        NotificationType.Warning);
                    await LoadFormDataSource();
                    return View(model);
                }

            }
            else
            {
                await LoadFormDataSource();
                return View(model);
            }
        }


        [Route("admin/blog/post/edit/{id}")]
        public async Task<IActionResult> Edit([FromRoute]int id)
        {
            var model = await _blogService.GetWithSeoAsync(id);
            await LoadFormDataSource(int.Parse(model.Categories));
            return View(model);
        }

        [HttpPost]
        [Route("admin/blog/post/edit")]
        public async Task<IActionResult> Edit(SavePostViewModel model)
        {
            if (ModelState.IsValid)
            {
                model.Url = model.Url.TrimStart(new char[] { '/' });
                model.AutoFill();
                model.PostAuthorId = User.Identity.GetIdentityUserId();
                if (model.PostId != 0)
                {
                    if (model.ThumbnailImageFile != null)
                    {
                        //model.ThumbnailImage = await _storageProvider.Save("blog", model.ThumbnailImageFile);
                        model.ThumbnailImage = await _storageProvider.Save(model.ThumbnailImageFile);
                    }
                    if (model.CoverImageFile != null)
                    {
                        // model.CoverImage = await _storageProvider.Save("blog", model.CoverImageFile);
                        model.CoverImage = await _storageProvider.Save(model.CoverImageFile);
                    }

                    if (model.IsNew == false && model.OldUrl == model.Url)
                    {
                        await _blogService.SavePost(model);
                        _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                        return RedirectToAction("Index");
                    }
                    else
                    {
                        if (!await _blogService.CheckUrlExists(model.Url))
                        {
                            await _blogService.SavePost(model);
                            _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                            return RedirectToAction("Index");
                        }
                        else
                        {
                            ModelState.TryAddModelError("Url", "url is already in use.");
                            _notificationService.Notify("Alert", "Url is already in use.",
                                NotificationType.Warning);
                            await LoadFormDataSource();
                            return View(model);
                        }

                    }
                }
                _notificationService.Notify("Alert", "Invalid inputs or missing inputs on submited form.",
                    NotificationType.Warning);
                await LoadFormDataSource(int.Parse(model.Categories));
                return View(model);
            }
            else
            {
                _notificationService.Notify("Alert", "Invalid inputs or missing inputs on submited form.",
                    NotificationType.Warning);
                await LoadFormDataSource(int.Parse(model.Categories));
                return View(model);
            }
        }

        [HttpPost]
        [Route("admin/blog/post/delete")]
        public async Task<JsonResult> Delete(int id)
        {
            await _blogService.PostCrudService.UpdateAsDeleted(id);
            _notificationService.Notify("Success", "Data deleted successfully.",
                NotificationType.Success);
            return Json(true);
        }
        #endregion

        #region Category 

        [Route("admin/blog/category/page/{pageNo?}")]
        [Route("admin/blog/category")]//default make it at last
        public async Task<IActionResult> CategoryIndex([FromRoute]int pageNo = 1, [FromQuery]string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            var model = await _blogService.CategoryService.GetListPagedAsync(pageNo, rowsPerPage, 1,
                "Where Name like @Query", "Name asc", new { Query = "%" + query + "%" });
            return View(model);
        }

        [Route("admin/blog/category/new")]
        public async Task<IActionResult> CategoryNew()
        {

            return View();
        }


        [HttpPost]
        [Route("admin/blog/category/new")]
        public async Task<IActionResult> CategoryNew(PostCategory model)
        {
            if (ModelState.IsValid)
            {
                if (model.PostCategoryId == 0)
                {
                    model.AutoFill();


                    var status = await _blogService.CategoryService.InsertAsync<int>(model);
                    _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data has been saved successfully!"), NotificationType.Success);
                    return RedirectToAction("CategoryIndex");

                }
                return RedirectToAction("CategoryIndex");
            }
            else
            {
                var d = ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList();
                _notificationService.Notify(_localeResourceProvider.Get("Validation"), string.Join(',', d), NotificationType.Error);

                return View(model);
            }
        }




        [Route("admin/blog/category/edit/{id}")]
        public async Task<IActionResult> CategoryEdit([FromRoute]int id)
        {
            var resource = await _blogService.CategoryService.GetAsync(id);
            return View(resource);
        }

        [HttpPost]
        [Route("admin/blog/category/edit")]
        public async Task<IActionResult> CategoryEdit(PostCategory model, string oldUrl)
        {
            if (ModelState.IsValid)
            {
                if (model.PostCategoryId != 0)
                {
                    model.AutoFill();

                    var status = await _blogService.CategoryService.UpdateAsync(model);
                    _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data has been saved successfully!"),
                        NotificationType.Success);
                    return RedirectToAction("CategoryIndex");
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
        [Route("admin/blog/category/delete")]
        public async Task<JsonResult> CategoryDelete(int id)
        {
            try
            {

                var result = await _blogService.CategoryService.DeleteAsync(id);
                _notificationService.Notify(_localeResourceProvider.Get("Success"), _localeResourceProvider.Get("Data deleted successfully!"), NotificationType.Success);
                return Json(new { code = 200, Message = "", Data = result });
            }
            catch (Exception e)
            {
                return Json(new { code = 200, Message = e.Message, Data = false });
            }

        }
        [Route("admin/blog/setting")]
        public async Task<IActionResult> Setting()
        {

            return View();
        }

        [HttpPost]
        [Route("admin/blog/setting")]
        public async Task<IActionResult> Setting(PostSetting model)
        {
            if (ModelState.IsValid)
            {

                model.AutoFill();

                if (model.PostSettingId == 0)
                    await _blogService.SettingCrudService.InsertAsync(model);
                else
                    await _blogService.SettingCrudService.UpdateAsync(model);

                _notificationService.Notify("Success", "Data has been saved successfully!", NotificationType.Success);
                return RedirectToAction("Setting");

            }
            else
            {
                return View(model);
            }
        }
        #endregion

    }
}