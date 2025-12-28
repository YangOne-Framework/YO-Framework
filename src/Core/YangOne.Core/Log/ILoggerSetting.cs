using System.Threading.Tasks;

namespace YangOne.Log
{
    public interface ILoggerSetting
    {
        bool AllowLogging { get; set; }
    }
}