using System.Data.Common;
using Dapper;
using YangOne.Caching;
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    public class SettingService : ISettingService
    {
        private readonly ICacheService _cacheService;

        public SettingService(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }
        public CrudService<Setting> CrudService { get; set; } = new CrudService<Setting>();
        private const string Key = "YO.Setting";
        public async Task<Setting> GetSetting()
        {

            return await _cacheService.GetAsync<Setting>(Key, async () => await this.CrudService.GetAsync(1));

        }

        public async Task<Setting> SaveSetting(Setting setting)
        {
            _cacheService.Remove(Key);
            setting.SettingId = 1;
            await this.CrudService.UpdateAsync(setting);
            return await GetSetting();
        }

        public async Task<Setting> SaveSetting(Setting setting, long userId)
        {
            _cacheService.Remove(Key);
            setting.SettingId = 1;
            await this.CrudService.UpdateAsync(setting);
            return await GetSetting();
        }
    }
}
