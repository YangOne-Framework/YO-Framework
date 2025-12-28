using YangOne.Data;
using Microsoft.AspNetCore.Http;

namespace YangOne.Plugin
{
    public interface IPluginService
    {
        CrudService<Plugin> PluginCrudService { get; set; }
        Task<bool> UpdateStatus(Plugin plugin);
        Task<bool> AddPlugins(IEnumerable<Plugin> plugins);
        Task<PluginInstallStatus> UnzipAndInstall(IFormFile zipFile);
    }
}