using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Web.API
{
    /// <summary>
    /// this api authorize attribute to only post responses for invalid token 
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
    public class ApiAuthorizeAttribute : AuthorizeAttribute, IAsyncAuthorizationFilter
    {

        public ApiAuthorizeAttribute()
        {
        }

        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
           
            var skipAuthorization = ((Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor)context.ActionDescriptor).MethodInfo.CustomAttributes.Any(x => x.AttributeType == typeof(AllowAnonymousAttribute) || x.AttributeType == typeof(AllowAnonymousFilter));

            if (skipAuthorization)
            {
                return;
            }

            //var authenticationService = context.HttpContext.RequestServices.GetService<IAuthenticationService>();
            //var result = await authenticationService.AuthenticateAsync(context.HttpContext, "Bearer");
            //if (!result.Succeeded)
            //{
            //    context.Result = new JsonResult(new { Code = 401, Message = "Unauthorized Request" });
            //    return;
            //}
            var schemeProvider = context.HttpContext.RequestServices
                .GetRequiredService<IAuthenticationSchemeProvider>();

            var defaultScheme = await schemeProvider.GetDefaultAuthenticateSchemeAsync();
            if (defaultScheme == null)
            {
                throw new InvalidOperationException(
                    "No default authentication scheme configured.");
            }

            var result = await context.HttpContext.AuthenticateAsync(defaultScheme.Name);
            if (!result.Succeeded)
            {
                context.Result = new JsonResult(new { Code = 401, Message = "Unauthorized Request" })
                {
                    StatusCode = StatusCodes.Status401Unauthorized
                };
            }


        }
    }
}