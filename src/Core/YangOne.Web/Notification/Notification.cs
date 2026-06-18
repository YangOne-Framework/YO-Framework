// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    /// <summary>
    /// Represents a notification message with title, message body, type, and target audience.
    /// </summary>
    public class Notification
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public NotifyTo NotifyTo { get; set; } = NotifyTo.MeOnly;
    }

    /// <summary>
    /// Specifies the target audience for a notification.
    /// </summary>
    public enum NotifyTo
    {
        MeOnly,
        AllUser,
        AdminOnly,
        SpecificUsers,
    }
}
