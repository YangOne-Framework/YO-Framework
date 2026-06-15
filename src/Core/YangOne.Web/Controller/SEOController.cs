using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace YangOne.Web
{
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
