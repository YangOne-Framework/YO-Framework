using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Razor;
using YangOne.Web;

namespace YangOne.Web.Grid
{
    public interface IHtmlGrid<T> : IHtmlContent
    {
        IYOGrid<T> Grid { get; }
        string PartialViewName { get; set; }
        IHtmlGrid<T> Pagination(Action<Pager> builder);
        IHtmlGrid<T> Build(Action<IYOGridColumnsOf<T>> builder);
        //IHtmlGrid<T> ProcessWith(IGridProcessor<T> processor);

        //IHtmlGrid<T> Filterable(Boolean isFilterable);
        //IHtmlGrid<T> MultiFilterable();
        //IHtmlGrid<T> Filterable();

        //IHtmlGrid<T> Sortable(Boolean isSortable);
        //IHtmlGrid<T> Sortable();

        IHtmlGrid<T> RowCss(Func<T, string> cssClasses);
        IHtmlGrid<T> Css(string cssClasses);
        IHtmlGrid<T> Empty(string text);
        IHtmlGrid<T> Empty(Func<dynamic, HelperResult> template);
        IHtmlGrid<T> Named(string name);

        //IHtmlGrid<T> Pageable(Action<IGridPager<T>> builder);
        // IHtmlGrid<T> Pageable();
        IHtmlGrid<T> AddCommands(Action<IYOGridCommandsOf<T>> action);
    }
}