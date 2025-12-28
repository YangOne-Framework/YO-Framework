namespace YangOne.Plugin
{
    
    public interface IPlugin
    {
        string SystemName { get; }
        Task<bool> Install();
        Task<bool> UnInstall();
        PluginConfig Configuration { get; set; }

    }

}