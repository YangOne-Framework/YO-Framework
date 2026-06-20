// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace YOApp
{

    /// <summary>
    /// Adds security requirements to non-anonymous OpenAPI operations
    /// </summary>
    internal sealed class AuthOperationTransformer : IOpenApiOperationTransformer
    {
        public Task TransformAsync(
            OpenApiOperation openApiOperation,
            OpenApiOperationTransformerContext openApiOperationContext,
            CancellationToken cancellationToken)
        {
            var hasAllowAnonymousAttribute = openApiOperationContext.Description.ActionDescriptor.EndpointMetadata
                .OfType<AllowAnonymousAttribute>()
                .Any();

            if (hasAllowAnonymousAttribute)
            {
                return Task.CompletedTask;
            }

            openApiOperation.Security ??= new List<OpenApiSecurityRequirement>();

            openApiOperation.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", openApiOperationContext.Document)] = new List<string>()
            });

            return Task.CompletedTask;
        }
    }
}
