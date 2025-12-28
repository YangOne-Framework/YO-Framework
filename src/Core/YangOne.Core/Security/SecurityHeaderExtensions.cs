using System;
using Microsoft.AspNetCore.Builder;

namespace YangOne.Security
{
    public static class SecurityHeaderExtensions
    {
        public static IApplicationBuilder UseSecurityHeadersMiddleware(this IApplicationBuilder app, Action<SecurityHeadersBuilder> builder)
        {
            var headBuilder = new SecurityHeadersBuilder();
            builder(headBuilder);
            SecurityHeadersPolicy policy = headBuilder.Build();
           
            return app.UseMiddleware<SecurityHeadersMiddleware>(policy);
        }
    }
}