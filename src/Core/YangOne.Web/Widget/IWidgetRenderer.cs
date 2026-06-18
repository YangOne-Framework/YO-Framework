// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace YangOne.Web
{
    /// <summary>
    /// Renders a widget to HTML content.
    /// </summary>
    public interface IWidgetRenderer
    {
        Task<IHtmlContent> Render(IWidget widget,ViewContext viewContext);
    }
}
