// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace YangOne.Web.Security.API;

/// <summary>
/// Output formatter that encrypts JSON responses.
/// </summary>
public class EncryptedJsonFormatter : TextOutputFormatter
{
    private readonly EncryptionService _encryptionService;

    public EncryptedJsonFormatter(EncryptionService encryptionService)
    {
        _encryptionService = encryptionService;
        SupportedMediaTypes.Add("application/json");
        SupportedMediaTypes.Add("text/json"); // Add additional types if needed
        SupportedEncodings.Add(System.Text.Encoding.UTF8);
    }

    public override async Task WriteResponseBodyAsync(OutputFormatterWriteContext context, System.Text.Encoding selectedEncoding)
    {
        var response = context.HttpContext.Response;
        var originalData = context.Object;

        // Serialize to JSON first
        var json = System.Text.Json.JsonSerializer.Serialize(originalData);

        // Encrypt the JSON
        var encryptedData = _encryptionService.Encrypt(json);

        await response.WriteAsync(encryptedData);
    }
}
