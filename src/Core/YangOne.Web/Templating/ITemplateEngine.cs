// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Defines a template engine for rendering templates with models.
    /// </summary>
    public interface ITemplateEngine
    {
        string Render(string template,object model);
        string Render(string template, object model, bool isHtml);
        string RenderFromFile(string filePath, object model,bool isHtml);
    }
}
