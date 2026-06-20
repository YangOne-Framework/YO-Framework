// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using YangOne.Web.API;

namespace YangOne.Web.API.OpenAPI
{
    public class ApiResponseConvention : IApplicationModelConvention
    {
        public void Apply(ApplicationModel application)
        {
            foreach (var controller in application.Controllers)
            {
                var controllerType = controller.ControllerType.AsType();

                bool isBaseApi = typeof(BaseApiController).IsAssignableFrom(controllerType);

                if (!isBaseApi)
                    continue;

                foreach (var action in controller.Actions)
                {
                    if (action.Attributes.OfType<ApiExplorerSettingsAttribute>().Any(a => a.IgnoreApi))
                        continue;

                    if (!HasResponseType(action, 200))
                    {
                        var responseDataAttr = action.ActionMethod.GetCustomAttributes(typeof(ResponseDataAttribute), true)
                            .Cast<ResponseDataAttribute>().FirstOrDefault();

                        if (responseDataAttr != null)
                        {
                            var explicitType = typeof(ApiResponse<>).MakeGenericType(responseDataAttr.DataType);
                            action.Filters.Add(new ProducesResponseTypeAttribute(explicitType, 200));
                        }
                        else if (isBaseApi)
                        {
                            var explicitType = ExtractConcreteApiResponse(action.ActionMethod.ReturnType);
                            if (explicitType != null)
                                action.Filters.Add(new ProducesResponseTypeAttribute(explicitType, 200));
                        }
                        else
                        {
                            action.Filters.Add(new ProducesResponseTypeAttribute(typeof(ApiResponse<object>), 200));
                        }
                    }

                    AddIfMissing(action, typeof(ApiResponse<object>), 400);
                    AddIfMissing(action, typeof(ApiResponse<object>), 401);
                    AddIfMissing(action, typeof(ApiResponse<object>), 500);
                }
            }
        }

        private static bool HasResponseType(ActionModel action, int statusCode)
        {
            return action.Filters.OfType<ProducesResponseTypeAttribute>().Any(f => f.StatusCode == statusCode);
        }

        private static void AddIfMissing(ActionModel action, Type type, int statusCode)
        {
            if (!HasResponseType(action, statusCode))
                action.Filters.Add(new ProducesResponseTypeAttribute(type, statusCode));
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
