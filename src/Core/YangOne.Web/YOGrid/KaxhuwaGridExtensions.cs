using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;
using Mustache;
using YangOne.Web.Form;

namespace YangOne.Web.Grid
{
    public static class YOGridExtensions
    {
        public static object GetPriamaryKey(this IYOGridRow<Object> row)
        {
            object value = 0;
            var Name = "";
            foreach (var prop in row.Model.GetType().GetProperties())
            {

                if (prop.GetCustomAttribute<KeyAttribute>() != null)
                {
                    System.TypeCode typeCode = System.Type.GetTypeCode(prop.PropertyType);
                    if (typeCode == TypeCode.Int64)
                    {
                        value = (long)prop.GetValue(row.Model);
                    }
                    else
                    {
                        value = (int)prop.GetValue(row.Model);
                    }

                }
            }
            return value;

        }
        public static int GetRowTotal(this IYOGridRow<Object> row)
        {
            int value = 0;
            foreach (var prop in row.Model.GetType().GetProperties())
            {

                if (prop.Name.ToLower()=="rowtotal")
                {
                    value = (int)prop.GetValue(row.Model);
                   
                }
            }
            return value;

        }

        public static IYOGridColumn<TModel> RenderedAs<TModel>(this IYOGridColumn<TModel> column, Func<TModel, Object> value)
        {
            column.RenderValue = value;

            return column;
        }

        public static T Encoding<T>(this T column, Boolean isEncoded) where T : IYOGridColumn
        {
            column.IsEncoded = isEncoded;

            return column;
        }
        public static T Template<T>(this T column, String format) where T : IYOGridColumn
        {
            column.Format = format;
            column.FormControl = FormInputControl.Empty;
            return column;
        }
        public static T Css<T>(this T column, String cssClasses) where T : IYOGridColumn
        {
            column.CssClasses = cssClasses;

            return column;
        }
        public static T SetTitle<T>(this T column, Object value) where T : IYOGridColumn
        {
            column.Title = value as IHtmlContent ?? new HtmlString(value?.ToString());

            return column;
        }
        public static T Named<T>(this T column, String name) where T : IYOGridColumn
        {
            column.Name = name;

            return column;
        }
        public static YOHtmlGrid<T> CreateKachuwaGrid<T>(this IHtmlHelper html, IEnumerable<T> source) where T : class
        {
            return new YOHtmlGrid<T>(html, new YoGrid<T>(source));
        }
        public static YOHtmlGrid<T> CreateKachuwaGrid<T>(this IHtmlHelper html, String partialViewName, IEnumerable<T> source) where T : class
        {
            return new YOHtmlGrid<T>(html, new YoGrid<T>(source)) { PartialViewName = partialViewName };
        }

        public static YOHtmlForm<T> CreateKachuwaForm<T>(this IHtmlHelper html,string name) where T : class, new()
        {
            return new YOHtmlForm<T>(html, new YOForm<T>(name));
        }
        public static YOHtmlForm<T> CreateKachuwaForm<T>(this IHtmlHelper html,string name,T modalObj) where T : class, new()
        {
            return new YOHtmlForm<T>(html, new YOForm<T>(name,modalObj));
        }
        public static IHtmlGrid<T> HideSearchBar<T>(this IHtmlGrid<T> grid) 
        {
            grid.Grid.HideSearchBar = true;
            return grid;
        }
        public static IHtmlGrid<T> HideSearchBarButton<T>(this IHtmlGrid<T> grid)
        {
            grid.Grid.HideSearcButton = true;
            return grid;
        }
        public static IHtmlGrid<T> DisableRowSelection<T>(this IHtmlGrid<T> grid)
        {
            grid.Grid.DisableRowSelection = true;
            return grid;
        }
        public static IHtmlGrid<T> UseCardView<T>(this IHtmlGrid<T> grid)
        {
            grid.Grid.UseCardView = true;
            return grid;
        }
        public static T SetFormHeading<T>(this T form, string heading) where T : IForm<T>
        {
            form.Heading = heading;
            return form;
        }
        public static string Render<T>(this IYOHtmlForm<T> form) where T : class
        {
            var res = RenderForm(form);
            return res;
        }

        private static string RenderForm(Object obj) 
        {
            string template =
                "<div id=\"{{Name}}\" class=\"kachuwa-form\">< form name =\"{{Name}}\" class=\"{{CssClasses}}\"></form></div>";

            FormatCompiler compiler = new FormatCompiler();
            Generator generator = compiler.Compile(template);
            string result = generator.Render(obj);
            return result;
        }
        public static T SetFormControl<T>(this T column, FormInputControl formControl) where T : IYOGridColumn
        {
            column.FormControl = formControl;

            return column;
        }

        
        public static T SetFormClasses<T>(this T column, string classes) where T : IYOGridColumn
        {
            column.FormClasses = classes;

            return column;
        }
        public static IHtmlGrid<T> GridInSideForm<T>(this IHtmlGrid<T> grid)
        {
            grid.Grid.UseInsideForm = true;
            return grid;
        }
        public static IHtmlGrid<T> SetFormPostName<T>(this IHtmlGrid<T> grid,string keyName)
        {
            grid.Grid.FormPostKeyName = keyName;
            return grid;
        }
        public static T SetFormControl<T>(this T column, FormInputControl formControl, IEnumerable<FormInputItem> dataSource,string selectedValue="") where T : IYOGridColumn
        {
            column.FormControl = formControl;
            if (dataSource != null)
            {
                var columnDataSource = dataSource.ToList();
                foreach (var x in columnDataSource)
                {
                    x.IsSelected = x.Value == selectedValue;
                }
                column.DataSource = columnDataSource;
            }

            return column;
        }
        //public static T SetFormControl<T>(this T column, FormInputControl formControl, IEnumerable<FormInputItem> dataSource, Expression<Func<T, string>> constraint) where T : IYOGridColumn
        //{
        //    column.FormControl = formControl;
        //    if (dataSource != null)
        //    {
        //        var expresionProvider = ContextResolver.Context.RequestServices
        //            .GetService(typeof(ModelExpressionProvider)) as ModelExpressionProvider;
        //        string selectedValue = expresionProvider.GetExpressionText(constraint);
        //        var columnDataSource = dataSource.ToList();
        //        foreach (var x in columnDataSource)
        //        {
        //            x.IsSelected = x.Value == selectedValue;
        //        }
        //        column.DataSource = columnDataSource;
        //    }

        //    return column;
        //}
        
    }
}