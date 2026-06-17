// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Hosting;
using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Formatting.Compact;

namespace YangOne.Log.Serilog
{
    public class SerilogFileLogger : ILogger, IDisposable
    {
        private readonly ILoggerSetting _loggerSetting;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private global::Serilog.Core.Logger _baseLogger;
        private global::Serilog.ILogger _currentLogger;

        public SerilogFileLogger(IWebHostEnvironment hostingEnvironment, ILoggerSetting loggerSetting)
        {
            _hostingEnvironment = hostingEnvironment;
            _loggerSetting = loggerSetting;
            _baseLogger = CreateLogger("yangone");
            _currentLogger = _baseLogger;
        }

        private global::Serilog.Core.Logger CreateLogger(string name)
        {
            var basePath = Path.Combine(_hostingEnvironment.ContentRootPath, "Logs");
            Directory.CreateDirectory(basePath);

            var path = Path.Combine(basePath, $"{name}_.log");

            return new LoggerConfiguration()
                .MinimumLevel.Verbose()
                .WriteTo.File(
                    formatter: new CompactJsonFormatter(),
                    path: path,
                    rollingInterval: RollingInterval.Day,
                    rollOnFileSizeLimit: true,
                    fileSizeLimitBytes: 10L * 1024 * 1024,
                    retainedFileCountLimit: 31,
                    shared: true)
                .CreateLogger();
        }

        public bool Log(LogType logtype, Func<string> messageFunc, object obj = null)
        {
            if (!_loggerSetting.AllowLogging)
                return false;

            var level = ConvertLogLevel(logtype);
            var message = messageFunc();

            if (obj is Exception ex)
                _currentLogger.Write(level, ex, message);
            else if (obj != null)
                _currentLogger.Write(level, "{@Payload} {Message}", obj, message);
            else
                _currentLogger.Write(level, message);

            return true;
        }

        public bool CreateFile<T>()
        {
            var typeName = typeof(T).FullName ?? typeof(T).Name;
            _currentLogger = CreateLogger(typeName);
            return true;
        }

        public bool CreateFile(string name)
        {
            _currentLogger = CreateLogger(name);
            return true;
        }

        public void Dispose()
        {
            _baseLogger?.Dispose();
        }

        private static LogEventLevel ConvertLogLevel(LogType logType) => logType switch
        {
            LogType.Trace => LogEventLevel.Verbose,
            LogType.Debug => LogEventLevel.Debug,
            LogType.Info => LogEventLevel.Information,
            LogType.Warn => LogEventLevel.Warning,
            LogType.Error => LogEventLevel.Error,
            LogType.Fatal => LogEventLevel.Fatal,
            _ => LogEventLevel.Information
        };
    }
}

