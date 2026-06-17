// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    public class Notification
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public NotificationType Type { get; set; }
        public NotifyTo NotifyTo { get; set; } = NotifyTo.MeOnly;
    }

    public enum NotifyTo
    {
        MeOnly,
        AllUser,
        AdminOnly,
        SpecificUsers,
    }
}
