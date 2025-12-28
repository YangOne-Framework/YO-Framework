using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using YangOne.Admin.HtmlBuilder;
using YangOne.Log;

namespace YangOne.Web.Components
{
   
    [ViewComponent(Name = "HtmlBuilder")]
    public class HtmlBuilderViewComponent : YangOneViewComponent
    {
        private readonly ILogger _logger;
        private readonly IWebHostEnvironment _hostEnvironment;

        public HtmlBuilderViewComponent(ILogger logger,IWebHostEnvironment webHostEnvironment)
        {
            _logger = logger;
            _hostEnvironment = webHostEnvironment;
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            try
            {
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

                return View(ll);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => "Html Builder loading error.", e);
                throw e;
            }

        }

        public override string DisplayName { get; } = "Html Builder";
        public override bool IsVisibleOnUI { get; } = false;
    }
}
