// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    /// <summary>
    /// Defines configuration options for the notification bar templates and behavior.
    /// </summary>
    public interface INotificationBarConfig
    {
        bool AutoClose { get; set; }
        string SuccessTemplate { get; set; }
        string ErrorTemplate { get; set; }
        string WarningTemplate { get; set; }
        string InfoTemplate { get; set; }
        string BroadCast { get; set; }

    }
}
