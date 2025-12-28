namespace YangOne.Installer
{
    public interface IYangOneConfigurationManager
    {
        Task<bool> Install(string connectionString);
        Task<bool> Install(InstallationDbInfo model);
        Task<bool> Install(string connectionString, string dbProvider);
        Task<bool> Unintall(string connectionString);
        Task<string> BackUpDb(string connectionString);
        Task<string> BackUpSystem();
        Task<bool> CheckConnection(string connectionString, string dbProvider);
    }
}