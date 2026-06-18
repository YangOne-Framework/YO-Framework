// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    /// <summary>
    /// Defines a component that builds a collection of sitemap nodes.
    /// </summary>
    public interface ISiteMapBuilder
    {
        IEnumerable<SitemapNode> Build();
    }
}
