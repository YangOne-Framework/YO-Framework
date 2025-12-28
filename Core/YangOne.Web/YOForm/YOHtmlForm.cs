using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Rendering;
using YangOne.Web.Grid;
using YangOne.Web.Razor;

namespace YangOne.Web.Form
{
    public interface IForm
    {
        string Name { get; set; }
        bool VerticalForm { get; set; }
        string Heading { get; set; }
        string Action { get; set; }
        string SubHeading { get; set; }
        string CssClasses { get; set; }
        string EncType { get; set; }

        Boolean RequestAntiFrogeryToken { get; set; }
        ViewContext ViewContext { get; set; }
        IFormCollection FormCollections { get; set; }

        // IYOGridColumns<IYOGridColumn> Columns { get; }
        // IFormRows<Object> Rows { get; }
        IYOGridCommands<IYOGridCommand> Commands { get; }

        IFormSections<IFormSection> Sections { get; }

        object FormModel { get; }
        string CancelUrl { get; set; }
        // bool HideCancelButton { get; set; }
        string SubmitButtonText { get; set; }
        string CancelButtonText { get; set; }
        bool HideCancelButton { get; set; }
        bool UseTabs { get; set; }

    }

    public interface IForm<T> : IForm
    {
        T Model { get; set; }
        // new IYOGridColumnsOf<T> Columns { get; }
        //  new IFormRows<T> Rows { get; }
        new IYOGridCommandsOf<T> Commands { get; }

        new IFormSectionsOf<T> Sections { get; }

    }

    public class YOForm<T> : IForm<T> where T : class, new()
    {
        public IForm<T> Form { get; set; }
        public string Name { get; set; } = "";
        public string Action { get; set; } = "";
        public string CssClasses { get; set; } = "";
        public string EncType { get; set; }
        public T Model { get; set; }
        public IFormCollection FormCollections { get; set; }
        public ViewContext ViewContext { get; set; }
        //  public IList<IGridProcessor<T>> Processors { get; set; }

        //IYOGridColumns<IYOGridColumn> IYOGrid.Columns => Columns;
        //public IYOGridColumnsOf<T> Columns { get; set; }

        IFormSections<IFormSection> IForm.Sections => Sections;
        public string CancelUrl { get; set; } = "#";

        public IFormSectionsOf<T> Sections { get; set; }
        public object FormModel => Model;

        public YOForm(string formName)
        {
            Name = formName;
            Sections = new FormSections<T>(this);
            Model = new T();
        }
        public YOForm(string formName, T model)
        {
            Name = formName;
            Model = model ?? new T();
            Sections = new FormSections<T>(this);

        }
        public IYOGridCommandsOf<T> Commands { get; set; }
        public Boolean RequestAntiFrogeryToken { get; set; }

        IYOGridCommands<IYOGridCommand> IForm.Commands => Commands;

        public virtual IForm<T> CreateSection(Action<IFormSectionsOf<T>> builder)
        {
            builder(Form.Sections);

            return this;
        }

        public Boolean VerticalForm { get; set; }
        public string Heading { get; set; }
        public string SubHeading { get; set; }

        public string SubmitButtonText { get; set; }
        public string CancelButtonText { get; set; }
        public bool HideCancelButton { get; set; }
        public bool UseTabs { get; set; }

    }

    public interface IYOHtmlForm<T> : IHtmlContent
    {

    }
    public class YOHtmlForm<T> : IYOHtmlForm<T>
    {
        public IForm<T> Form { get; set; }
        public IHtmlHelper Html { get; set; }
        public string PartialViewName { get; set; }
        public YOHtmlForm(IHtmlHelper html, IForm<T> form)
        {
            Form = form;
            // form.Query = form.Query ?? html.ViewContext.HttpContext.Request.Query;
            Form.ViewContext = form.ViewContext ?? html.ViewContext;
            PartialViewName = "YOGrid/Form";
            Html = html;

        }
        public virtual YOHtmlForm<T> SetHeading(string heading)
        {
            Form.Heading = heading;

            return this;
        }
        public virtual YOHtmlForm<T> SetSubHeading(string subHeading)
        {
            Form.SubHeading = subHeading;

            return this;
        }
        public virtual YOHtmlForm<T> SetClasses(string classes)
        {
            Form.CssClasses = classes;

            return this;
        }
        public virtual YOHtmlForm<T> CancelUrl(string url)
        {
            Form.CancelUrl = url;

            return this;
        }
        public virtual YOHtmlForm<T> ActionUrl(string actionUrl)
        {
            Form.Action = actionUrl;

            return this;
        }
        public virtual YOHtmlForm<T> HideCancelButton()
        {
            Form.HideCancelButton = true;

            return this;
        }
        public virtual YOHtmlForm<T> SetSubmitButtonText(string text)
        {
            Form.SubmitButtonText = text;

            return this;
        }
        public virtual YOHtmlForm<T> SetCancelButtonText(string text)
        {
            Form.CancelButtonText = text;

            return this;
        }
        public virtual YOHtmlForm<T> EncType(string encType)
        {
            Form.EncType = encType;

            return this;
        }
        public virtual YOHtmlForm<T> UseTabs()
        {
            Form.UseTabs = true;

            return this;
        }



        public virtual IYOHtmlForm<T> CreateSection(Action<IFormSectionsOf<T>> builder)
        {
            builder(Form.Sections);

            return this;
        }
        //public virtual IHtmlGrid<T> ProcessWith(IKachuwaGridProcessor<T> processor)
        //{
        //    Grid.Processors.Add(processor);

        //    return this;
        //}



        //public virtual IHtmlGrid<T> RowCss(string cssClasses)
        //{
        //    Form.CssClasses = cssClasses;

        //    return this;
        //}
        //public virtual IForm<T> Css(string cssClasses)
        //{
        //    Grid.CssClasses = cssClasses;

        //    return this;
        //}
        //public virtual IHtmlGrid<T> Empty(string text)
        //{
        //    Grid.NoDataText = text;

        //    return this;
        //}
        //public virtual IHtmlGrid<T> Named(string name)
        //{
        //    Grid.Name = name;

        //    return this;
        //}


        //public virtual IHtmlGrid<T> Pageable(Action<KachuwaPager> builder)
        //{
        //    Grid.Pager = new KachuwaPager(100, 1);
        //    builder(Grid.Pager);


        //    return this;
        //}
        //public virtual IHtmlGrid<T> Pageable()
        //{
        //    return Pageable(builder => { });
        //}
        //public virtual IHtmlGrid<T> AddCommands(Action<IYOGridCommandsOf<T>> builder)
        //{
        //    builder(Grid.Commands);

        //    return this;
        //}
        public void WriteTo(TextWriter writer, HtmlEncoder encoder)
        {
            try
            {
                var renderer = (IViewRenderService)ContextResolver.Context.RequestServices.GetService(typeof(IViewRenderService));
                var result = "";
                Task.Run(async () => result = await renderer.RenderToStringAsync(PartialViewName, Form)).Wait();
                writer.Write(result);
                //Html.Partial(PartialViewName, Form).WriteTo(writer, encoder);

            }
            catch (Exception e)
            {

                throw e;
            }

        }


    }
}
