using YangOne.Data;

namespace YangOne.Web.Module
{
    public interface IModuleService
    {
        CrudService<ModuleInfo> Service { get; set; }
        Task<bool> Save(IModule module);
        Task<bool> Uninstall(string moduleName);
        Task<bool> ReInstall(string moduleName);
    }
}