using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YangOne.Admin.HtmlBuilder;
using YangOne.Localization;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.Notification;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    public class HtmlBuilderController : BaseController
    {
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly ILogger _logger;

        public HtmlBuilderController(

            INotificationService notificationService,
            ILocaleResourceProvider localeResourceProvider,
            IWebHostEnvironment hostEnvironment,
            ILogger logger
        )
        {
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;
            _hostEnvironment = hostEnvironment;
            _logger = logger;

            //  var z = new Email2TemplateDataSource();
            //var asdf=  Activator.CreateInstance(z.GetType());
            //  var x = new TemplateDataSourceManager();
            // var templates= x.GetTemplateDataSource<ITemplateDataSource<IEmailTemplate>>();
            //  x.GetAllTemplateDataSource();
        }

        [Route("admin/html/builder")]
        [Route("html/builder")]
        public async Task<IActionResult> Index()
        {
            // var builder = new InvoiceTemplateComponentBuilder(_hostEnvironment);
            //  var components = builder.GetTemplateComponents();
            var htmlBuilderPath = Path.Combine(_hostEnvironment.ContentRootPath, "Templates", "HtmlBuilder");
            var components = Directory
                .GetFiles(htmlBuilderPath, "*config.json", SearchOption.AllDirectories)
                .ToList();
            var ll = new List<HtmlTemplate>();
            foreach (var c in components)
            {
                string cd = Path.GetDirectoryName(c);
                var config = System.IO.File.ReadAllText(c);
                var template = JsonConvert.DeserializeObject<HtmlTemplate>(config);
                var templateFile = Directory
                    .GetFiles(cd, "*template.html", SearchOption.AllDirectories);
                template.Template = System.IO.File.ReadAllText(templateFile[0]);
                var settingFiles = Directory
                    .GetFiles(cd, "*setting.html", SearchOption.AllDirectories);
                if (settingFiles.Any())
                {
                    template.SettingViewPath =
                        settingFiles[0].Replace(_hostEnvironment.ContentRootPath, "").Replace(@"\", @"/");
                }

                ll.Add(template);
            }

            //var settings = Directory
            //    .GetFiles(htmlBuilderPath, "*setting.html", SearchOption.AllDirectories)
            //    .Select(x=>x.Replace(_hostEnvironment.ContentRootPath, "").Replace(@"\",@"/")).ToArray();

            //ViewData["FormDataSource"] = await LoadFormData();
            return View(ll);
        }


        [Route("admin/html/builder/components")]
        public async Task<JsonResult> GetComponents()
        {
            //var builder = new InvoiceTemplateComponentBuilder();
            //var components = builder.GetTemplateComponents();
            var htmlBuilderPath = Path.Combine(_hostEnvironment.ContentRootPath, "Templates", "HtmlBuilder");
            var components = Directory
                .GetFiles(htmlBuilderPath, "*config.json", SearchOption.AllDirectories)
                .ToList();
            var ll = new List<HtmlTemplate>();
            foreach (var c in components)
            {
                string cd = Path.GetDirectoryName(c);
                var config = System.IO.File.ReadAllText(c);
                var template = JsonConvert.DeserializeObject<HtmlTemplate>(config);
                var templateFile = Directory
                    .GetFiles(cd, "*template.html", SearchOption.AllDirectories);
                template.Template = System.IO.File.ReadAllText(templateFile[0]);
                var settingFiles = Directory
                    .GetFiles(cd, "*setting.html", SearchOption.AllDirectories);
                if (settingFiles.Any())
                {
                    template.SettingViewPath =
                        settingFiles[0].Replace(_hostEnvironment.ContentRootPath, "").Replace(@"\", @"/");
                }

                template.Showcase = $"/hb/{template.Name}/img/showcase.png";
                ll.Add(template);
            }
            return Json(new { Code = 200, Data = ll });
        }
    }
}