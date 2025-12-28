using YangOne.Data.Crud;

namespace YangOne.Web.Module
{
    public interface IScriptRunner
    {
        Task<bool> Run(string[] scripts);
        Task<bool> Run(Dialect dialect, string connectionString, string[] scripts);
        Task<bool> CheckConnection(Dialect dialect, string connectionString);
    }
}