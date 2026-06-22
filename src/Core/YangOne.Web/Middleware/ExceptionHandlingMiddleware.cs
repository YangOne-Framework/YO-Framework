// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using YangOne.Log;

namespace YangOne.Web.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, IWebHostEnvironment env)
        {
            _next = next;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var logger = context.RequestServices.GetService<ILogger>();
                logger?.Log(LogType.Error, () => $"Unhandled exception: {context.Request.Method} {context.Request.Path}", ex);

                if (context.Response.HasStarted)
                {
                    logger?.Log(LogType.Warn, () => "Response already started, cannot write error response.");
                    return;
                }

                context.Response.Clear();
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

                var isApiRequest = context.Request.Path.StartsWithSegments("/api", StringComparison.OrdinalIgnoreCase);

                if (isApiRequest)
                {
                    context.Response.ContentType = "application/json; charset=utf-8";
                    var errorResponse = new
                    {
                        code = 500,
                        message = _env.IsDevelopment() ? ex.Message : "An internal error occurred."
                    };
                    var json = JsonSerializer.Serialize(errorResponse);
                    await context.Response.WriteAsync(json);
                }
                else
                {
                    context.Response.ContentType = "text/html; charset=utf-8";
                    var message = _env.IsDevelopment()
                        ? $"<pre>{WebUtility.HtmlEncode(ex.ToString())}</pre>"
                        : "<h1>500 - Internal Server Error</h1>";
                    await context.Response.WriteAsync($"<html><body>{message}</body></html>");
                }
            }
        }
    }

    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
