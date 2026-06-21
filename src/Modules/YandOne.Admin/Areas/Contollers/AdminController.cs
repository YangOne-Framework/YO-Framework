using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;
using YangOne.Web;

namespace YangOne.Admin.Areas.Contollers
{
    [Area("Admin")]
    public class AdminController:BaseController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
