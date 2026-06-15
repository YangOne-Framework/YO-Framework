using Microsoft.AspNetCore.Hosting;
using YangOne.Log.Serilog;

namespace YangOne.Log
{
    public class DefaultLogProvider : ILogProvider
    {
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly ILoggerSetting _loggerSetting;

        public DefaultLogProvider(IWebHostEnvironment hostingEnvironment, ILoggerSetting loggerSetting)
        {
            _hostingEnvironment = hostingEnvironment;
            _loggerSetting = loggerSetting;
        }

        public ILogger GetLogger(string name)
        {
            return new SerilogFileLogger(_hostingEnvironment, _loggerSetting);
        }

    }
}