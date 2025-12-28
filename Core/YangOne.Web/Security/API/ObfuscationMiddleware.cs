using Microsoft.AspNetCore.Http;

namespace YangOne.Web.Security.API;

public class ObfuscationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ObfuscationService _obfuscationService;

    public ObfuscationMiddleware(RequestDelegate next, ObfuscationService obfuscationService)
    {
        _next = next;
        _obfuscationService = obfuscationService;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Capture the original response stream
        var originalBodyStream = context.Response.Body;

        try
        {
            using (var memoryStream = new MemoryStream())
            {
                context.Response.Body = memoryStream;

                await _next(context);

                memoryStream.Seek(0, SeekOrigin.Begin);
                var reader = new StreamReader(memoryStream);
                var originalResponse = await reader.ReadToEndAsync();

                // Obfuscate the response if it's JSON
                if (context.Response.ContentType?.Contains("application/json") == true)
                {
                    var obfuscatedResponse = _obfuscationService.Obfuscate(originalResponse);

                    // Reset the stream and write the obfuscated response
                    memoryStream.SetLength(0);
                    var writer = new StreamWriter(memoryStream);
                    await writer.WriteAsync(obfuscatedResponse);
                    await writer.FlushAsync();
                }

                memoryStream.Seek(0, SeekOrigin.Begin);
                await memoryStream.CopyToAsync(originalBodyStream);
            }
        }
        finally
        {
            context.Response.Body = originalBodyStream;
        }
    }
}