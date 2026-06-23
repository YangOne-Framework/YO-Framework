using Microsoft.AspNetCore.Mvc;
using YangOne.Web;

namespace YOApp.Controllers
{
    public class HomeController : BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
