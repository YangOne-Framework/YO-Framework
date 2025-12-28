using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Web.Module
{
    public class YangOneModuleController<T> : BaseController where T : IModule, new()
    {
        private readonly IModuleManager _moduleManager;
        private readonly IModule _module;
        protected YangOneModuleController()
        {

            _moduleManager= ContextResolver.Context.RequestServices.GetService<IModuleManager>();
            _module = new T();
            _module = _moduleManager.FindAsync(_module.Name).GetAwaiter().GetResult();

        }
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);

            if (!_module.IsInstalled)
            {
                filterContext.Result = new RedirectResult("/page-not-found");
            }
        }
    }
}