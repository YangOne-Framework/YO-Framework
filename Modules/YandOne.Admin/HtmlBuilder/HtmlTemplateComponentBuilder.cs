using YangOne.Web.Templating;

namespace YangOne.Admin.HtmlBuilder;

public class HtmlTemplateComponentBuilder : ITemplateComponentBuilder<HtmlTemplate>
{

    public IEnumerable<HtmlTemplate> Templates { get; set; }
    public IEnumerable<HtmlTemplate> GetTemplateComponents()
    {
        throw new NotImplementedException();
    }
}