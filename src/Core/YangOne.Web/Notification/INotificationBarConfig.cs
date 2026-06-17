// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
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
