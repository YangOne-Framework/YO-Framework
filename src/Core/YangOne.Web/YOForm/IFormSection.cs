// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.IO;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

/// <summary>
/// Custom HTML content that renders a partial view.
/// </summary>
public class MyContent : IHtmlContent
{
    public IHtmlHelper Html { get; set; }

    public MyContent(IHtmlHelper html)
    {
        Html = html;
    }
    public void WriteTo(TextWriter writer, HtmlEncoder encoder)
    {
        Html.Partial("_PageNotFound").WriteTo(writer, encoder);
    }
   
}

/// <summary>
/// Provides extension methods for rendering my content.
/// </summary>
public static class tt
{
    public static MyContent RenderMyContent(this IHtmlHelper html)
    {
        return new MyContent(html);
    }
}
