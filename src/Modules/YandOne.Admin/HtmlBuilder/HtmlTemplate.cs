// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;
using YangOne.Web.Templating;

namespace YangOne.Admin.HtmlBuilder
{
    /// <summary>
    /// Represents a class HtmlTemplate.
    /// </summary>
    public class HtmlTemplate : IHtmlTemplateComponent
    {
        public List<TemplateSetting> Settings { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Icon { get; set; }
        public string IconClass { get; set; }
        public string Template { get; set; }
        public IEnumerable<string> IncludeJsLibrary { get; set; }
        public string Render(ITemplateSettings settings)
        {
            throw new System.NotImplementedException();
        }

        public string SettingViewComponentName { get; set; }
        public string SettingViewPath { get; set; }
        public string Showcase { get; set; }
        public ITemplateSettings TemplateSettings { get; set; }
    }
}
