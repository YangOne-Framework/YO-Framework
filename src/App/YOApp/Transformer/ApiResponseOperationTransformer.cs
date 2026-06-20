// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using YangOne.Web.API;

namespace YOApp
{
    /// <summary>
    /// Auto-generates correct OpenAPI response schemas for BaseApiController and BaseApiController derived controllers.
    /// Resolves ApiResponse&lt;T&gt; from ActionResult&lt;ApiResponse&lt;T&gt;&gt; using STJ schema generation.
    /// </summary>
    internal sealed class ApiResponseOperationTransformer : IOpenApiOperationTransformer
    {
        public async Task TransformAsync(
            OpenApiOperation operation,
            OpenApiOperationTransformerContext context,
            CancellationToken cancellationToken)
        {
            if (context.Description.ActionDescriptor is not ControllerActionDescriptor controllerActionDescriptor)
                return;

            var controllerType = controllerActionDescriptor.ControllerTypeInfo.AsType();

            bool isBaseApi = typeof(BaseApiController).IsAssignableFrom(controllerType);

            if (!isBaseApi)
                return;

            var methodInfo = controllerActionDescriptor.MethodInfo;

            var responseDataAttr = methodInfo.GetCustomAttributes(typeof(ResponseDataAttribute), true)
                .Cast<ResponseDataAttribute>().FirstOrDefault();

            Type responseType;
            if (responseDataAttr != null)
            {
                responseType = typeof(ApiResponse<>).MakeGenericType(responseDataAttr.DataType);
            }
            else if (isBaseApi)
            {
                var extracted = ExtractConcreteApiResponse(methodInfo.ReturnType);
                if (extracted == null)
                    return;
                responseType = extracted;
            }
            else
            {
                responseType = typeof(ApiResponse<object>);
            }

            if (!operation.Responses.TryGetValue("200", out var response))
            {
                response = new OpenApiResponse { Description = "Success" };
                operation.Responses["200"] = response;
            }

            var schema = await context.GetOrCreateSchemaAsync(responseType, null, cancellationToken);

            response.Content["application/json"] = new OpenApiMediaType
            {
                Schema = schema
            };
        }

        private static Type ExtractConcreteApiResponse(Type returnType)
        {
            if (returnType == null || returnType == typeof(void) || returnType == typeof(Task))
                return null;

            if (returnType.IsGenericType && returnType.GetGenericTypeDefinition() == typeof(Task<>))
                returnType = returnType.GetGenericArguments()[0];

            if (!returnType.IsGenericType || returnType.GetGenericTypeDefinition() != typeof(ActionResult<>))
                return null;

            var innerType = returnType.GetGenericArguments()[0];

            if (innerType.IsGenericType && innerType.GetGenericTypeDefinition() == typeof(ApiResponse<>))
                return innerType;

            return typeof(ApiResponse<>).MakeGenericType(innerType);
        }
    }
}
