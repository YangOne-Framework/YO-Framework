// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
namespace YangOne.Web.Notification
{
    /// <summary>
    /// Default implementation of <see cref="INotificationBarConfig"/> providing HTML templates for notification types.
    /// </summary>
    public class NotificationBarConfig : INotificationBarConfig
    {
        public bool AutoClose { get; set; } = false;

        public string SuccessTemplate { get; set; } = "" +
                                                      "<div class='notification green'>" +
                                                      "<div class='dismiss'> <i class='fa fa-times-circle'></i></div>" +
                                                      "<div class='notification-body'>" +
                                                      "<div class='circle'>" +
                                                      "<i class='fa fa-2x fa-check'></i>" +
                                                      " </div>" +
                                                      "<div class='info'>" +
                                                      "<span class='notification-title'>{{Title}}</span>" +
                                                      "<span class='notification-content'>{{Message}}</span>" +
                                                      "</div> </div>";
        public string ErrorTemplate { get; set; } = 
                                                    "<div class='notification red'>" +
                                                    "<div class='dismiss'> <i class='fa fa-times-circle'></i></div>" +
                                                    "<div class='notification-body'>" +
                                                    "<div class='circle'>" +
                                                    "<i class='fa fa-2x fa-times'></i>" +
                                                    " </div>" +
                                                    "<div class='info'>" +
                                                    "<span class='notification-title'>{{Title}}</span>" +
                                                    "<span class='notification-content'>{{Message}}</span>" +
                                                    "</div> </div>";
        public string WarningTemplate { get; set; } = 
                                                      "<div class='notification yellow'>" +
                                                      "<div class='dismiss'> <i class='fa fa-times-circle'></i></div>" +
                                                      "<div class='notification-body'>" +
                                                      "<div class='circle'>" +
                                                      "<i class='fa fa-2x fa-exclamation-triangle'></i>" +
                                                      " </div>" +
                                                      "<div class='info'>" +
                                                      "<span class='notification-title'>{{Title}}</span>" +
                                                      "<span class='notification-content'>{{Message}}</span>" +
                                                      "</div> </div>";
        public string InfoTemplate { get; set; } =
                                                   "<div class='notification teal'>" +
                                                   "<div class='dismiss'> <i class='fa fa-times-circle'></i></div>" +
                                                   "<div class='notification-body'>" +
                                                   "<div class='circle'>" +
                                                   "<i class='fa fa-2x fa-fa-info'></i>" +
                                                   " </div>" +
                                                   "<div class='info'>" +
                                                   "<span class='notification-title'>{{Title}}</span>" +
                                                   "<span class='notification-content'>{{Message}}</span>" +
                                                   "</div> </div>";
        public string BroadCast { get; set; } = "";

    }
}
