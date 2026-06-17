// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Razor
{
    public interface IViewRenderService
    {
        Task<string> RenderToStringAsync(string controller, string viewName, object model);
        Task<string> RenderToStringAsync(string viewName, object model);
        Task<string> RenderTemplateAsync(string viewName, object model);
    }
}
