using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using YangOne.Web.Razor;

namespace YangOne.Web.Grid
{
    public class YOHtmlGrid<T> : IHtmlGrid<T>
    {
        public IYOGrid<T> Grid { get; set; }
        public IHtmlHelper Html { get; set; }
        public string PartialViewName { get; set; }

        public YOHtmlGrid(IHtmlHelper html, IYOGrid<T> grid)
        {
            grid.Query = grid.Query ?? html.ViewContext.HttpContext.Request.Query;
            grid.ViewContext = grid.ViewContext ?? html.ViewContext;
            PartialViewName = "YOGrid/Grid";
            Html = html;
            Grid = grid;
        }
        
          public virtual IHtmlGrid<T> Pagination(Action<Pager> builder)
        {
            builder(Grid.Pager);
            Grid.Pager.Reset();
            return this;
        }
        public virtual IHtmlGrid<T> Build(Action<IYOGridColumnsOf<T>> builder)
        {
            builder(Grid.Columns);

            return this;
        }
        //public virtual IHtmlGrid<T> ProcessWith(IYOGridProcessor<T> processor)
        //{
        //    Grid.Processors.Add(processor);

        //    return this;
        //}

        public virtual IHtmlGrid<T> UseCard()
        {
            Grid.UseCardView = true;

            return this;
        }

        public virtual IHtmlGrid<T> RowCss(Func<T, string> cssClasses)
        {
            Grid.Rows.CssClasses = cssClasses;

            return this;
        }
        public virtual IHtmlGrid<T> Css(string cssClasses)
        {
            Grid.CssClasses = cssClasses;

            return this;
        }
        public virtual IHtmlGrid<T> Empty(string text)
        {
            Grid.NoDataText = text;

            return this;
        }
        public virtual IHtmlGrid<T> Empty(Func<dynamic, HelperResult> template)
        {
            Grid.NoDataTemplate = template;

            return this;
        }
        public virtual IHtmlGrid<T> Named(string name)
        {
            Grid.Name = name;

            return this;
        }


        public virtual IHtmlGrid<T> Pageable(Action<Pager> builder)
        {
            Grid.Pager = new Pager(100,1);
            builder(Grid.Pager);
            

            return this;
        }
        public virtual IHtmlGrid<T> Pageable()
        {
            return Pageable(builder => { });
        }
        public virtual IHtmlGrid<T> AddCommands(Action<IYOGridCommandsOf<T>> builder)
        {
            builder(Grid.Commands);

            return this;
        }
        public void WriteTo(TextWriter writer, HtmlEncoder encoder)
        {
           // Html.Partial(PartialViewName, Grid).WriteTo(writer, encoder);
            var renderer = (IViewRenderService)ContextResolver.Context.RequestServices.GetService(typeof(IViewRenderService));
            var result = "";
            Task.Run(async () => result = await renderer.RenderToStringAsync(PartialViewName, Grid)).Wait();
            writer.Write(result);
        }


    }
}