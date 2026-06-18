// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Web.Templating;

namespace YangOne.Admin.HtmlBuilder;

/// <summary>
/// Represents a class HtmlTemplateComponentBuilder.
/// </summary>
public class HtmlTemplateComponentBuilder : ITemplateComponentBuilder<HtmlTemplate>
{

    public IEnumerable<HtmlTemplate> Templates { get; set; }
    public IEnumerable<HtmlTemplate> GetTemplateComponents()
    {
        throw new NotImplementedException();
    }
}
