using Microsoft.AspNetCore.Mvc;
using YangOne.Log;

namespace YangOne.Web.Components
{
    [ViewComponent(Name = "VideoPicker")]
    public class VideoPickerViewComponent : YangOneViewComponent
{
        private readonly ILogger _logger;
    
        public VideoPickerViewComponent(ILogger logger)
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
                _logger.Log(LogType.Error, () => "Video Picker loading error.", e);
                throw e;
            }

        }

        public override string DisplayName { get; } = "Video Picker";
        public override bool IsVisibleOnUI { get; } = false;
    }
}
