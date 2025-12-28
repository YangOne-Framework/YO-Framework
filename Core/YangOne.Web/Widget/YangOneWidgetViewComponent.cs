namespace YangOne.Web
{
    public abstract class YangOneWidgetViewComponent<T> : YangOneViewComponent where T : IWidget, new()
    {

        public override bool IsVisibleOnUI { get; } = false;

    }
}