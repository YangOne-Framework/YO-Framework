//using Microsoft.AspNetCore.Mvc;
//using YangOne.Web;
//using YangOne.Web.Theme;

//namespace YangOne.BlogEngine.Controllers
//{
//    public class BlogController : BaseController
//    {
//        [Route("blog")]
//        [Route("blog/page/{page?}")]
//        public IActionResult Index([FromRoute]int page = 1)
//        {
//            return ViewComponent("LatestPost", new { page = page, query = "" });
//        }

//        [Route("admin/blog/manage")]
//        [Route("admin/blog/manage/{page:int?}")]
//        [Route("admin/blog/manage/{query?}/{page:int?}")]
//        [Theme("Admin")]
//        public IActionResult ManageBlog([FromRoute]int page = 1, [FromRoute]string query = "")
//        {
//            return ViewComponent("BlogManager", new { page = page, query = query });
//        }

//        [Route("admin/blog/setting")]
//        public IActionResult Setting()
//        {
//            return ViewComponent("BlogSetting");
//        }
//        [Route("posts/{url}")]
//        public IActionResult Index([FromRoute]string url)
//        {
//            return ViewComponent("PostDetail", new { url = url });
//        }

//        [Route("posts/search/{query}/{page?}")]
//        public IActionResult Search([FromRoute]int page = 1, [FromRoute]string query = "")
//        {
//            return ViewComponent("PostSearch", new { page = page, query = query });
//        }

//        [Route("posts/tags/{tag}/{page?}")]
//        public IActionResult ByTags([FromRoute]int page = 1, [FromRoute]string tag = "")
//        {
//            return ViewComponent("PostTag", new { page = page, tag = tag });
//        }

//        [Route("posts/byauthors/{authorname}/{page?}")]
//        public IActionResult Index([FromRoute]string authorname,[FromRoute]int page = 1)
//        {
//            return ViewComponent("BlogAuthor", new { page = page, authorname = authorname });
//        }
//    }
//}