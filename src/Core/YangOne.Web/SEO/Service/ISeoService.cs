// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using YangOne.Data;
using YangOne.Web.Model;

namespace YangOne.Web
{
    /// <summary>
    /// Provides methods to manage SEO metadata, generate meta tags, JSON-LD, and sitemap XML.
    /// </summary>
    public interface ISeoService
    {
        CrudService<SEO> Seo { get; set; }
        Task<bool> CheckUrlExist(string url, string type);
        Task<string> GenerateMetaContents();
        Task<SEO> GetBySeoType(string seoType, int id);
        Task<string> GenerateJsonLdForWebSite();
        Task<string> GenerateJsonLdForPage();
        Task<SEO> GetByProductId(int producId, string type);
        Task<string> GenerateJsonLdForPage(string page,int productId,string type);
        Task<string> GetSEOMetaContentsAsync(string url, string type);
        Task<SEO> GetSEODataAsync(string url, string type);
        Task<string> GetSitemapXml();
    }
}
