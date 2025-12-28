using System.Collections.Generic;
using YangOne.Web.Templating;

namespace YangOne.Admin.HtmlBuilder
{
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