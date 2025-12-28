using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace YangOne.Web
{
    public interface IWidgetRenderer
    {
        Task<IHtmlContent> Render(IWidget widget,ViewContext viewContext);
    }
}