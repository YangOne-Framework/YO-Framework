//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using YangOne.BlogEngine.Service;

//namespace Kachuwa.BlogEngine
//{
//    public class BlogAuthorViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public BlogAuthorViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync(int page, string authorname = "")
//        {
//            var setting = await _service.SettingCrudService.GetAsync(1);
//            int postsperpage = setting == null ? 10 : setting.LatestPostPerPage;
//            // var posts = await _service.PostCrudService.GetListPagedAsync(page, postsperpage, 1, "Where Author ='" + authorname + "' ", "PostId desc");
//            var tags = await _service.TagCrudService.GetListAsync();
//            var posts = await _service.GetPostByAuthor(page, postsperpage,authorname);

//            int rowTotal = posts.Any() != false ? posts.First().RowTotal : 0;
//            var model = new PostViewModel();
//            model.Posts = posts;
//            model.Pager = new KachuwaPager(rowTotal, page, postsperpage);
//            model.AllTags = tags;
//            ViewData["authorname"] = authorname;
//            return View(model);
//        }
//    }
//}