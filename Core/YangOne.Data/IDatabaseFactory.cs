using System.Data;
using YangOne.Data.Crud;
using YangOne.Log;

namespace YangOne.Data
{
    public interface IDatabaseFactory : IDisposable
    {
        IDbConnection Db { get; }
        Dialect Dialect { get; }
        QueryBuilder QueryBuilder { get; }
        IDbConnection GetConnection();
        ILogger DbLogger { get; set; }
     }
}