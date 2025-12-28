namespace YangOne.Web
{
    public interface IWidget
    {
        string SystemName { get; }
        string Description { get; set; }
        string Author { get; set; }
        IEnumerable<WidgetSetting> Settings { get; set; }
        //Task<IHtmlContent> Render();
        Type WidgetViewComponent { get; set; }
    }
}
