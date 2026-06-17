// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web
{
    public interface ISitemapProvider
    {
        string CreateSitemap(IEnumerable<SitemapNode> nodes);

    }
}
