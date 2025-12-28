using System.Collections;
using System.Linq.Expressions;
using System.Reflection;
using Microsoft.AspNetCore.Html;
using Newtonsoft.Json;

namespace YangOne.Web.Grid
{

    public interface IYOGridCommand
    {
        string Name { get; set; }
        string Command { get; set; }
        string CssClasses { get; set; }
        string IconClass { get; set; }
        string ClientCallback { get; set; }
        string ClientCallbackUrl { get; set; }
        string Controller { get; set; }
        string Action { get; set; }
        IHtmlContent ValueFor(IYOGridRow<Object> row);
    }
    public interface IYOGridCommand<T> : IYOGridCommand
    {
        IYOGrid<T> Grid { get; }
        LambdaExpression Expression { get; }
        Func<T, Object> RenderValue { get; set; }
    }
    public interface IYOGridCommands<out T> : IEnumerable<T> where T : IYOGridCommand
    {
    }
    public interface IYOGridCommandsOf<T> : IYOGridCommands<IYOGridCommand<T>>
    {
        IYOGrid<T> Grid { get; set; }

        IYOGridCommand<T> Add<TValue>(string name, string command, string callback);
        IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass, string callback );
        IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass, string callback,  Expression<Func<T, TValue>> callbackParam, string callBackUrl);

        IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass, string callback,  string action, Expression<Func<T, TValue>> expression);
    }


    public abstract class BaseYOGridCommand<T, TValue> : IYOGridCommand<T>
    {
        public string Name { get; set; }
        public string Command { get; set; }
        public string CssClasses { get; set; }
        public string IconClass { get; set; }
        public string ClientCallback { get; set; }
        public string ClientCallbackUrl { get; set; }
        public string Controller { get; set; }
        public string Action { get; set; } = "#";
        public IYOGrid<T> Grid { get; set; }
        public Func<T, Object> RenderValue { get; set; }
        public Func<T, TValue> ExpressionValue { get; set; }
        LambdaExpression IYOGridCommand<T>.Expression => Expression;
        public Expression<Func<T, TValue>> Expression { get; set; }
        public abstract IHtmlContent ValueFor(IYOGridRow<Object> row);

    }


    public class YOGridCommand<T, TValue> : BaseYOGridCommand<T, TValue> where T : class
    {

        public YOGridCommand(IYOGrid<T> grid, string name, string command, string callback)
        {
            Grid = grid;
            Name = name;
            Command = command;
            ClientCallback = callback;

        }
        public YOGridCommand(IYOGrid<T> grid, string name, string command, string callback, string iconClass)
        {
            Grid = grid;
            Name = name;
            Command = command;
            ClientCallback = callback;
            IconClass = iconClass;

        }
        public YOGridCommand(IYOGrid<T> grid, string name, string command, string callback, string iconClass, string action, Expression<Func<T, TValue>> expression)
        {
            Grid = grid;
            Name = name;
            Command = command;
            ClientCallback = callback;
            IconClass = iconClass;
            Action = action;
            Expression = expression;
            ExpressionValue = expression.Compile();

        }
        public YOGridCommand(IYOGrid<T> grid, string name, string command, string callback, string iconClass, string action, Expression<Func<T, TValue>> expression, string callbackUrl)
        {
            Grid = grid;
            Name = name;
            Command = command;
            ClientCallback = callback;
            IconClass = iconClass;
            Action = action;
            Expression = expression;
            ExpressionValue = expression.Compile();
            ClientCallbackUrl = callbackUrl;

        }

        public override IHtmlContent ValueFor(IYOGridRow<Object> row)
        {
            string value = GetValueFor(row);
            if (value == null)
                return HtmlString.Empty;

            return new HtmlString(value.ToString());
        }

        private string GetValueFor(IYOGridRow<Object> row)
        {
            try
            {
                if (RenderValue != null)
                    return RenderValue(row.Model as T).ToString();

                var value = ExpressionValue(row.Model as T);
                //for client call back param
                if (value.GetType().GetTypeInfo().IsClass)
                {
                    return JsonConvert.SerializeObject(value);
                }
                else
                {//redirect action url with value
                    if (string.IsNullOrEmpty(this.ClientCallback))
                        return $"{this.Action}/{value}";
                    else
                        return $"{value}";
                }
            }
            catch (NullReferenceException)
            {
                return null;
            }
        }

    }

    public class YOGridCommands<T> : List<IYOGridCommand<T>>, IYOGridCommandsOf<T> where T : class
    {
        public IYOGrid<T> Grid { get; set; }

        public YOGridCommands(IYOGrid<T> grid)
        {
            Grid = grid;
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return GetEnumerator();
        }

        public IYOGridCommand<T> Add<TValue>(string name, string command, string callback)
        {
            IYOGridCommand<T> column = new YOGridCommand<T, TValue>(Grid, name, command, callback);
            Add(column);

            return column;
        }

        public IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass,string callback)
        {
            IYOGridCommand<T> column = new YOGridCommand<T, TValue>(Grid, name, command, callback, iconClass);
            Add(column);

            return column;
        }
        public IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass, string callback, Expression<Func<T, TValue>> callbackParam, string callBackUrl)
        {
            IYOGridCommand<T> column = new YOGridCommand<T, TValue>(Grid, name, command, callback, iconClass, "", callbackParam, callBackUrl);

            Add(column);

            return column;
        }
        public IYOGridCommand<T> Add<TValue>(string name, string command, string iconClass, string callback,  string action, Expression<Func<T, TValue>> expression)
        {
            IYOGridCommand<T> column = new YOGridCommand<T, TValue>(Grid, name, command, callback, iconClass, action, expression);

            Add(column);

            return column;
        }


    }
}
