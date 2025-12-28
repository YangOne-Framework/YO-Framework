//using System.Linq;
//using System.Threading.Tasks;
//using Kachuwa.BlogEngine.Model;
//using Kachuwa.BlogEngine.Service;
//using Kachuwa.KGrid;
//using Kachuwa.Log;
//using Microsoft.AspNetCore.Mvc;

//namespace Kachuwa.BlogEngine
//{
//    public class PostTagViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public PostTagViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync(int page, string tag = "")
//        {
//            var setting = await _service.SettingCrudService.GetAsync(1);
//            int postsperpage = setting == null ? 10 : setting.LatestPostPerPage;

//            //var posts = await _service.PostCrudService.GetListPagedAsync(page, postsperpage, 1, "Where Tags like '%" + tag + "%' ", "PostId desc");

//            var posts = await _service.GetPostByTags(page, postsperpage, tag);

//            var tags = await _service.TagCrudService.GetListAsync();

//            int rowTotal = posts.Any() != false ? posts.First().RowTotal : 0;
//            var model = new PostViewModel();
//            model.Posts = posts;
//            model.Pager = new KachuwaPager(rowTotal, page, postsperpage);
//            model.AllTags = tags;

//            ViewData["tag"] = tag;
//            return View(model);
//        }
//    }
//}