using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public interface ISettingService
    {
        CrudService<Setting> CrudService { get; set; }
        Task<Setting> GetSetting();
        Task<Setting> SaveSetting(Setting setting);
        Task<Setting> SaveSetting(Setting setting, long userId);
    }
}