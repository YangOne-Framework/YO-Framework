using Microsoft.AspNetCore.Html;

namespace YangOne.Web.Notification
{
    public class NotificationViewModel
    {
        public INotificationBarConfig Config { get; set; }
        public List<Notification> Notifications { get; set; } = new List<Notification>();
        public List<HtmlString> Templates { get; set; } = new List<HtmlString>();
    }
}