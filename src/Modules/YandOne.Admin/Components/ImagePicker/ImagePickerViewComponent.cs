using Microsoft.AspNetCore.Mvc;
using YangOne.Log;
using YangOne.Web;

namespace YangOne.Web.Components
{

    [ViewComponent(Name = "ImagePicker")]
    public class ImagePickerViewComponent : YangOneViewComponent
    {
        private readonly ILogger _logger;
    
        public ImagePickerViewComponent(ILogger logger)
        {
            _logger = logger;
         
        }
        public async Task<IViewComponentResult> InvokeAsync()
        {
            try
            {
                return View();
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => "Image Picker loading error.", e);
                throw e;
            }

        }

        public override string DisplayName { get; } = "Image Picker";
        public override bool IsVisibleOnUI { get; } = false;
    }
}
