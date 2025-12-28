using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Service;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.Service;

namespace Kachuwa.Admin.Components
{
    public class AdminMenuViewComponent : ViewComponent
    {
        private readonly ILogger _logger;
        private readonly IMenuService _menuService;
        private readonly ISettingService _settingService;

        public AdminMenuViewComponent(ILogger logger,IMenuService menuService ,ISettingService settingService)
        {
            _logger = logger;
            _menuService = menuService;
            _settingService = settingService;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            try
            {
                var setting = await _settingService.CrudService.GetAsync(1);
                var menus = await _menuService.GetAdminMenus(User.Identity.GetRoles());
                return View(menus);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => "Admin menu loading error.", e);
                throw e;
            }
         
        }

    }
}