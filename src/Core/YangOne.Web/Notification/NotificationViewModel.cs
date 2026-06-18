// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Html;

namespace YangOne.Web.Notification
{
    /// <summary>
    /// View model that holds notification configuration and the list of notifications for rendering.
    /// </summary>
    public class NotificationViewModel
    {
        public INotificationBarConfig Config { get; set; }
        public List<Notification> Notifications { get; set; } = new List<Notification>();
        public List<HtmlString> Templates { get; set; } = new List<HtmlString>();
    }
}
