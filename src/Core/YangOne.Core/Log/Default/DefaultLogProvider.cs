// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Hosting;
using YangOne.Log.Serilog;

namespace YangOne.Log
{
    /// <summary>
    /// Provides default logger instances using Serilog file logging.
    /// </summary>
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
