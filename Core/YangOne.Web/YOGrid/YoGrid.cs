using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace YangOne.Web.Grid
{
    public interface IYOGrid
    {
        string Name { get; set; }
        string NoDataText { get; set; }
        Func<dynamic, HelperResult> NoDataTemplate { get; set; }
        string CssClasses { get; set; }
        ViewContext ViewContext { get; set; }
        IQueryCollection Query { get; set; }

        IYOGridColumns<IYOGridColumn> Columns { get; }
        IYOGridRows<Object> Rows { get; }
        IYOGridCommands<IYOGridCommand> Commands { get; }

        Pager Pager { get; set; }
        bool UseCardView { get; set; }
        string SearchBarClasses { get; set; }
        bool HideSearchBar { get; set; }
        bool HideSearcButton { get; set; }
        bool DisableRowSelection { get; set; }
        bool UseInsideForm { get; set; }
        string FormPostKeyName { get; set; }
    }

    public interface IYOGrid<T> : IYOGrid
    {
        IQueryable<T> Source { get; set; }
        new IYOGridColumnsOf<T> Columns { get; }
        new IYOGridRowsOf<T> Rows { get; }
        new IYOGridCommandsOf<T> Commands { get; }
    }

    public class YoGrid<T> : IYOGrid<T> where T : class
    {
       
        public string Name { get; set; }
        public Func<dynamic, HelperResult> NoDataTemplate { get; set; }
        public string CssClasses { get; set; }
        public string FooterPartialViewName { get; set; }

        public IQueryable<T> Source { get; set; }
        public IQueryCollection Query { get; set; }
        public ViewContext ViewContext { get; set; }

      //  public IList<IGridProcessor<T>> Processors { get; set; }

        IYOGridColumns<IYOGridColumn> IYOGrid.Columns => Columns;
        public IYOGridColumnsOf<T> Columns { get; set; }

        IYOGridRows<Object> IYOGrid.Rows => Rows;
        

        public IYOGridRowsOf<T> Rows { get; set; }
        public Pager Pager { get; set; }
        public bool UseCardView { get; set; } = false;
        public bool HideSearchBar { get; set; } = false;
        public bool HideSearcButton { get; set; } = false;
        public bool DisableRowSelection { get; set; } = false;
        public bool UseInsideForm { get; set; } = false;
        public string FormPostKeyName { get; set; }

        public YoGrid(IEnumerable<T> source)
        {
            //Processors = new List<IGridProcessor<T>>();
            Source = source.AsQueryable();
            Columns = new YOGridColumns<T>(this);
            Rows = new YOGridRows<T>(this);
            Commands = new YOGridCommands<T>(this);
           var row = Rows.FirstOrDefault();
           int rowTotal=row==null?0: row.GetRowTotal();
           Pager = new Pager(rowTotal, 1);
        }
        public string NoDataText { get; set; }
        public string  SearchBarClasses { get; set; }

        IYOGridCommands<IYOGridCommand> IYOGrid.Commands => Commands;
        public IYOGridCommandsOf<T> Commands { get; set; }

        //IYOGridCommands<IYOGridCommand> IYOGrid.Commands => Commands;
    }
}
