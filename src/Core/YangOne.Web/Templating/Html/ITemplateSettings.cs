namespace YangOne.Web.Templating

{
    public interface ITemplateSettings
    {
        IEnumerable<TemplateSetting> Settings { get; set; }
    }
}