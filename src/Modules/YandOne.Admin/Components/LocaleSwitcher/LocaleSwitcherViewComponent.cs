using Microsoft.AspNetCore.Mvc;
using YangOne.Web;

namespace YangOne.Web.Components
{
    
    [ViewComponent(Name = "LocaleSwitcher")]
    public class LocaleSwitcherViewComponent : YangOneViewComponent
    {

        public LocaleSwitcherViewComponent()
        {

        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            return View();
        }

        public override string DisplayName { get; } = "Language Switcher";
        public override bool IsVisibleOnUI { get; } = true;
    }
}
