using Microsoft.AspNetCore.Mvc;
using YangOne.Web;

namespace YangOne.Web.Components
{
    [ViewComponent(Name = "Pagination")]
    public class PaginationViewComponent : YangOneViewComponent
    {

        public PaginationViewComponent()
        {

        }

        public async Task<IViewComponentResult> InvokeAsync(Pager pager)
        {
            return View(pager);
        }

        public override string DisplayName { get; } = "Pagination";
        public override bool IsVisibleOnUI { get; } = false;
    }
}