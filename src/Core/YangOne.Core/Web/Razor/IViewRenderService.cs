namespace YangOne.Web.Razor
{
    public interface IViewRenderService
    {
        Task<string> RenderToStringAsync(string controller, string viewName, object model);
        Task<string> RenderToStringAsync(string viewName, object model);
        Task<string> RenderTemplateAsync(string viewName, object model);
    }
}