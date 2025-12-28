//using System.Threading.Tasks;
//using Kachuwa.BlogEngine.Service;
//using Kachuwa.Log;
//using Microsoft.AspNetCore.Mvc;

//namespace Kachuwa.BlogEngine
//{
//    public class BlogSettingViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public BlogSettingViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync()
//        {
//            var setting = await _service.SettingCrudService.GetAsync(1);
//            return View(setting);
//        }
//    }
//}