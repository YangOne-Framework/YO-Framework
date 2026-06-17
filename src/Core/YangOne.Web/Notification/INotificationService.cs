// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    public interface INotificationService
    {
        bool Notify(string title, string message);
        bool Notify(string title, string message, NotificationType notificationType);
        bool Notify(string message, NotificationType notificationType);
        bool Success(Notification notification);
        bool Error(Notification notification);
        bool Info(Notification notification);
        bool Warning(Notification notification);
        bool BroadCast(Notification notification);
        bool BroadCast(string roles, Notification notification);
    }
}
