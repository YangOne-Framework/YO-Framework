using System.Threading.Tasks;

namespace YangOne.Caching
{
    public interface ICacheConfig
    {
        Task Init();
        Task Terminate();
    }
}