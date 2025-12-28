using Microsoft.AspNetCore.Mvc;
using YangOne.Log;

namespace YangOne.Web.Components;

[ViewComponent(Name = "FilePicker")]
public class FilePickerViewComponent : YangOneViewComponent
{
    private readonly ILogger _logger;
    
    public FilePickerViewComponent(ILogger logger)
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
            _logger.Log(LogType.Error, () => "File Picker loading error.", e);
            throw e;
        }

    }

    public override string DisplayName { get; } = "File Picker";
    public override bool IsVisibleOnUI { get; } = false;
}