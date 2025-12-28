using YangOne.Web.Templating;

namespace YangOne.Admin.HtmlBuilder
{
    public interface IHtmlTemplateComponent : ITemplateComponent
    {

        /// <summary>
        /// name of the component
        /// </summary>
        string Name { get; set; }
        /// <summary>
        /// icon for the component
        /// </summary>
        string Icon { get; set; }
        /// <summary>
        /// classes for icon
        /// </summary>
        string IconClass { get; set; }
        /// <summary>
        /// default template or layout for the component
        /// </summary>
        string Template { get; set; }
       // string InitializeWith { get; set; }
        /// <summary>
        /// incase 3rd party js lib are required to enhanche component eg js barcode
        /// </summary>
        IEnumerable<string> IncludeJsLibrary { get; set; }
        /// <summary>
        /// final rendering wil be done according settings value
        /// </summary>
        /// <returns></returns>
        string Render(ITemplateSettings settings);
        /// <summary>
        /// list of setting controls
        /// </summary>


        string SettingViewComponentName { get; set; }
    }
}