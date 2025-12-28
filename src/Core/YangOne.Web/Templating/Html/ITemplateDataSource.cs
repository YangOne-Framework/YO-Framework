namespace YangOne.Web.Templating
{
    public interface ITemplateDataSource
    {
        TemplateTypes Type { get; }
        string Key { get; }
        Task RenderSource();
        Task RenderSource(Dictionary<string,object> parameters);
    }
}