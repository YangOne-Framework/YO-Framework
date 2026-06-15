using YandOne.Admin.ViewModel;
using YangOne.Web.Model;
using YangOne.Data;

namespace YangOne.Admin.Service
{
    public interface IMenuService
    {
        CrudService<Menu> MenuCrudService { get; set; }
        CrudService<MenuPermission> PermissionCrudService { get; set; }
        CrudService<MenuGroup> GroupCrudService { get; set; }
        CrudService<MenuSetting> SettingCrudService { get; set; }
        Task<int> SaveMenu(MenuViewModel model);
        Task<IEnumerable<MenuPermissionViewModel>> GetPermissionsFromCache();
        Task<IEnumerable<MenuPermissionViewModel>> GetAllPermissions();
        Task<bool> SaveMenuOrder(List<MenuOrderViewModel> orders);

        Task<IEnumerable<MenuViewModel>> GetFooterMenu();
        Task<IEnumerable<MenuViewModel>> GetAdminMenus(IEnumerable<string> roles);
        Task<IEnumerable<MenuViewModel>> GetAdminMenusByRole(string roleNames);
        Task<IEnumerable<MenuViewModel>> GetSiteFrontendMenuForUser();
    }
}