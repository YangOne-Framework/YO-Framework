// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.Extensions.Primitives;
using YangOne.Caching;
using YangOne.Log;

namespace YangOne.Web
{
    /// <summary>
    /// Implements <see cref="IChangeToken"/> to detect when a page view has been modified.
    /// </summary>
    public class PageChangeToken : IChangeToken
    {
        private readonly IPageService _pageService;
        private readonly ILogger _logger;
        private readonly ICacheService _cacheService;
        private string _viewPath;
       

        public PageChangeToken(IPageService pageService, ILogger logger, ICacheService cacheService, string viewPath)
        {

            _pageService = pageService;
            _logger = logger;
            _cacheService = cacheService;
            _viewPath = viewPath;
           
        }

        public bool ActiveChangeCallbacks => false;

        private bool CheckIsViewChanged()
        {
            try
            {
                var view = _pageService.CrudService.Get("WHERE Location = @Path", new { Path = _viewPath });
               
              
                if (view != null)
                {
                    return Convert.ToDateTime(view.LastModified) > Convert.ToDateTime(view.LastRequested);
                }
                return false;
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return false;
            }
        }
        private string[] ignoreFiles = new string[] { "Component", "Plugin", "Components", "Plugins", "_ViewImports", "_ViewStart", "_Layout" };

        public bool HasChanged
        {
            get
            {
                if (ignoreFiles.Any(_viewPath.Contains))
                {
                    return false;
                }
                //checking if view request from page controller
                object kpageUrl = null;
                var currentContext = ContextResolver.Context;
                if (currentContext == null)
                    return false;
                currentContext.Items.TryGetValue("KPageUrl", out kpageUrl);
                if (kpageUrl == null)
                    return false;
                else
                    return true;//if kpageUrl has value return true

            }
        }

        public IDisposable RegisterChangeCallback(Action<object> callback, object state) => EmptyDisposable.Instance;
    }
}
