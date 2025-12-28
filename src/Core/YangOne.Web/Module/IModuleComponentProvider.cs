namespace YangOne.Web.Module
{
    public interface IModuleComponentProvider
    {
        Dictionary<string, List<ModuleComponentDescription>> GetComponents();
        IEnumerable<ModuleComponentDescription> GetComponents(string moduleName);

    }
}