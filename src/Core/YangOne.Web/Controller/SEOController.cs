// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace YangOne.Web
{
    /// <summary>
    /// Controller providing SEO-related endpoints such as sitemap generation.
    /// </summary>
    public class SEOController : BaseController
    {
        private readonly ISeoService _seoService;

        public SEOController(ISeoService seoService)
        {
            _seoService = seoService;
        }

        [HttpGet("~/sitemap.xml")]
        [ResponseCache(Duration = 600, Location = ResponseCacheLocation.Any, NoStore = false)]
        public async Task<IActionResult> Sitemap()
        {

            var xmlContent = await _seoService.GetSitemapXml();           
            return Content(xmlContent, "application/xml", Encoding.UTF8);
        }

    }


}

