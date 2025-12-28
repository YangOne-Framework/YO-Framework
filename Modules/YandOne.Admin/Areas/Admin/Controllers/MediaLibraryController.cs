using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using YandOne.Admin.Service;
using YandOne.Admin.ViewModel;
using YangOne.Localization;
using YangOne.Web;
using YangOne.Web.Model;
using YangOne.Web.Module;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.Service;

namespace YandOne.Admin.Controllers
{

    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class MediaLibraryController : BaseController
    {

        private readonly ISettingService _settingService;
        private readonly INotificationService _notificationService;
        private readonly IMediaLibraryService _mediaLibraryService;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly Setting _webSetting;


        public MediaLibraryController(ISettingService settingService
        , INotificationService notificationService, IMediaLibraryService mediaLibraryService, ILocaleResourceProvider localeResourceProvider)
        {

            _settingService = settingService;
            _notificationService = notificationService;
            _mediaLibraryService = mediaLibraryService;
            _localeResourceProvider = localeResourceProvider;
            _webSetting = _settingService.CrudService.Get(1);
            _localeResourceProvider.LookUpGroupAt("MediaLibrary");
        }

        [Route("admin/media/library")]//default make it at last
        public async Task<IActionResult> Index([FromRoute] int pageNo = 1, [FromQuery] string query = "")
        {
            ViewData["Page"] = pageNo;
            int rowsPerPage = 10;
            //customized viewmodel with join
            return View();
        }

        [Route("admin/media/library/directory/save")]
        [HttpPost]
        public async Task<JsonResult> SaveDirectory(DirectoryViewModel model)
        {
            var status = await _mediaLibraryService.SaveDirecory(model);
            return Json(new { Code = 200, Msg = status.Message, Data = status.Success });
        }
        //[Route("admin/media/library/file/move")]
        //[HttpPost]
        //public async Task<JsonResult> MoveFileToDirecory(string filePath,string toDirectory)
        //{
        //    var status = await _mediaLibraryService.MoveFileToDirecory(filePath, toDirectory);
        //    return Json(new { Code = 200, Msg = status.Message, Data = status.Success });
        //}
        [Route("admin/media/library/file/rename")]
        [HttpPost]
        public async Task<JsonResult> RenameFileName(string oldFileName, string newFileName, string dir = "")
        {
            try
            {
                var status = await _mediaLibraryService.RenameFileName(oldFileName, newFileName, dir);
                return Json(new { Code = 200, Msg = status.Message, Data = status.Success });
            }
            catch (Exception e)
            {
                return Json(new { Code = 500, Msg = e.Message, Data = false });
            }
        }
        [Route("admin/media/library/contents")]
        [HttpPost]
        public async Task<JsonResult> GetItemsByDirectory(string currentDir = "/")
        {
            var items = await _mediaLibraryService.GetItemsByDirectory(currentDir);
            return Json(new { Code = 200, Msg = "ok", Data = items });
        }

        [Route("admin/media/library/contents/dir")]
        [HttpPost]
        public async Task<JsonResult> GetDirectory(string currentDir = "/")
        {
            var items = await _mediaLibraryService.GetDirectoriesOnly(currentDir);
            return Json(new { Code = 200, Msg = "ok", Data = items });
        }
        [Route("admin/media/library/save/file")]
        [HttpPost]
        public async Task<JsonResult> SaveFile(string dir = "")
        {
            try
            {
                var status = await _mediaLibraryService.SaveFile(Request.Form.Files[0], dir);
                return Json(new { Code = 200, Msg = status.Message, Data = status.Success });
            }
            catch (Exception e)
            {
                return Json(new { Code = 500, Msg = e.Message, Data = false });
            }
          
        }

        [Route("admin/media/library/file/copy")]
        [HttpPost]
        public async Task<JsonResult> CopyFileOrDir(List<MediaLibraryItem> files, string destinationDir)
        {
            var status = await _mediaLibraryService.CopyFilesOrDir(files, destinationDir);
            return Json(new { Code = 200, Msg = "File copied successfully!", Data = status });
        }
        [Route("admin/media/library/file/move")]
        [HttpPost]
        public async Task<JsonResult> MoveFileOrDir(List<MediaLibraryItem> files, string destinationDir)
        {
            var status = await _mediaLibraryService.MoveFilesOrDir(files, destinationDir);
            return Json(new { Code = 200, Msg = "File copied successfully!", Data = status });
        }
        [Route("admin/media/library/file/delete")]
        [HttpPost]
        public async Task<JsonResult> DeleteFileOrDir(List<MediaLibraryItem> files)
        {
            var status = await _mediaLibraryService.DeleteFilesOrDir(files);
            return Json(new { Code = 200, Msg = "File copied successfully!", Data = status });
        }

    }
}