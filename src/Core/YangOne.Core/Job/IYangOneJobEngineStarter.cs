using System.Threading.Tasks;

namespace YangOne.Job
{
    public interface IYangOneJobEngineStarter
    {
        Task Start();
        Task Stop();
    }
}