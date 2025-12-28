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
//    public class BlogManagerViewComponent : ViewComponent
//    {
//        private readonly IBlogService _service;
//        private readonly ILogger _logger;

//        public BlogManagerViewComponent(IBlogService service, ILogger logger)
//        {
//            _service = service;
//            _logger = logger;
//        }
//        public async Task<IViewComponentResult> InvokeAsync(int page=1, string query = "")
//        {
//            //var posts = await _service.PostCrudService.GetListPagedAsync(page, 10, 1, "Where Title like '%" + query + "%' ", "PostId desc");

//            var posts = await _service.GetPostByTitle(page, 10, query);


//            int rowTotal = posts.Any() != false ? posts.First().RowTotal : 0;

//            var model = new PostViewModel();
//            model.Posts = posts;
//            model.Pager = new KachuwaPager(rowTotal, page, 10);
//            ViewData["query"] = query;
//            return View(model);
//        }
//    }
//}