// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace YangOne.Web.Module
{
    /// <summary>
    /// Base controller for module-specific pages with installation check.
    /// </summary>
    public class YangOneModuleController<T> : BaseController where T : IModule, new()
    {
        private readonly IModuleManager _moduleManager;
        private readonly IModule _module;
        protected YangOneModuleController()
        {

            _moduleManager= ContextResolver.Context.RequestServices.GetService<IModuleManager>();
            _module = _moduleManager.Find(new T().Name);

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
