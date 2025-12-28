//using System.Threading.Tasks;
//using Kachuwa.BlogEngine.Model;
//using Kachuwa.BlogEngine.Service;
//using Kachuwa.Log;
//using Microsoft.AspNetCore.Mvc;

//namespace Kachuwa.BlogEngine
//{
//    public class PostDetailViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public PostDetailViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync(string url)
//        {
//            var setting = await _service.SettingCrudService.GetAsync(1);
//            var post = await _service.PostCrudService.GetAsync("Where Url=@url",new {url=url});

//            var tags = await _service.TagCrudService.GetListAsync();


//            var viewCount = post.ViewCount;
//            viewCount = viewCount + 1;

//            post.ViewCount = viewCount;
//            await _service.PostCrudService.UpdateAsync(post);

//           // ViewData["AllTags"] = tags;
//          //  ViewData["BlogSetting"] = setting;
//            var postmodel = new PostViewDetailModel();
//            postmodel.Post = post;
//            postmodel.AllTags = tags;
//            postmodel.Setting = setting;
//            return View(postmodel);
//        }
//    }
//}