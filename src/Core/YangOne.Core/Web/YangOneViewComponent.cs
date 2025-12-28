using Microsoft.AspNetCore.Mvc;

namespace YangOne.Web;

public abstract class YangOneViewComponent : ViewComponent
{

    public abstract string DisplayName { get; }

    public abstract bool IsVisibleOnUI { get; }

}