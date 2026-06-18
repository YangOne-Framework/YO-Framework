// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Log
{
    /// <summary>
    /// Logs unhandled exceptions to the configured logger.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class LogErrorAttribute : Attribute, IExceptionFilter
    {
        private  ILogger _logger;
        public LogErrorAttribute()
        {
            
        }
        public void OnException(ExceptionContext filterContext)
        {
            _logger = filterContext.HttpContext.RequestServices.GetService<ILogger>();
            _logger.Log(LogType.Error, () => filterContext.Exception.Message.ToString(), filterContext.Exception);

        }
    }
}
