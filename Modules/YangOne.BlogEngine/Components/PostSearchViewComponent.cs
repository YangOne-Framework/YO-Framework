//using System.Linq;
//using System.Threading.Tasks;
//using Kachuwa.BlogEngine.Model;
//using Kachuwa.BlogEngine.Service;
//using Kachuwa.KGrid;
//using Kachuwa.Log;
//using Kachuwa.Web;
//using Microsoft.AspNetCore.Mvc;

//namespace Kachuwa.BlogEngine
//{
//    public class PostSearchViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public PostSearchViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync(int page, string query = "")
//        {
//            var setting = await _service.SettingCrudService.GetAsync(1);
//            int postsperpage = setting == null ? 10 : setting.LatestPostPerPage;
//            //var posts = await _service.PostCrudService.GetListPagedAsync(page, postsperpage, 1, "Where Title like '%" + query + "%' ", "PostId desc");
//            var posts = await _service.GetPostByTitle(page, postsperpage, query);
//            var tags = await _service.TagCrudService.GetListAsync();
//            int rowTotal = posts.Any() != false ? posts.First().RowTotal : 0;
//            var model = new PostViewModel();
//            model.Posts = posts;
//            model.Pager = new KachuwaPager(rowTotal, page, postsperpage);
//            model.AllTags = tags;
//            ViewData["query"] = query;
//            return View(model);
//        }
//    }
//}