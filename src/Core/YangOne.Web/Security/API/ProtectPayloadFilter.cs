using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace YangOne.Web.Security.API;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ExcludeFromPayloadProtectionAttribute : Attribute { }

public class ProtectPayloadFilter : IAsyncResultFilter, IAlwaysRunResultFilter
{
    private readonly IApiPayloadSecurityService _securityService;

    public ProtectPayloadFilter(IApiPayloadSecurityService securityService)
    {
        _securityService = securityService;
    }

    public void OnResultExecuting(ResultExecutingContext context) { }

    public void OnResultExecuted(ResultExecutedContext context) { }

    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        // Skip if the action/controller has opted out
        if (context.ActionDescriptor.EndpointMetadata
            .Any(m => m is ExcludeFromPayloadProtectionAttribute))
        {
            await next();
            return;
        }

        if (context.Result is ObjectResult objectResult && objectResult.Value != null)
        {
            var wrapped = await _securityService.WrapPayload(objectResult.Value);

            // Only replace the result when a protection mode is active.
            // "None" mode means the original response is returned as-is.
            if (wrapped.Mode != "None")
            {
                objectResult.Value = wrapped;
                objectResult.DeclaredType = wrapped.GetType();
            }
        }

        await next();
    }
}