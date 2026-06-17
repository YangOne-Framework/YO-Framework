// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public class ControllerSiteMapBuilder : ISiteMapBuilder
    {
        private string BaseCategoryUrl { get; set; }
        private string BaseNewsUrl { get; set; }
        private string BaseVideoUrl { get; set; }
        private string BaseImageUrl { get; set; }

        //readonly UrlHelper _urlHelper=new UrlHelper(HttpContext.Current.Request.RequestContext);
        public IEnumerable<SitemapNode> Build()
        {
            List<SitemapNode> nodes = new List<SitemapNode>();
            nodes.Add(
                new SitemapNode()
                {
                    //Url = _urlHelper.AbsoluteRouteUrl("index", "Home"),
                    Priority = 1
                });
            return nodes;
        }

    }
}
