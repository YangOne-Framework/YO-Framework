// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.SignalR;
using YangOne.Identity.Extensions;
using YangOne.RTC.Hubs;
using YangOne.Web;
using YangOne.Web.Notification;

namespace YangOne.RTC
{
    /// <summary>
    /// Sends real-time notifications via SignalR to connected users
    /// </summary>
    public class RTCNotificationService : INotificationService
    {
        private readonly INotificationTempDataWrapper _tempDataWrapper;

        private readonly IHubContext<YangOneUserHub> _hubContext;

        private readonly IRTCConnectionManager _connectionManager;

        public RTCNotificationService(INotificationTempDataWrapper tempDataWrapper,
            IHubContext<YangOneUserHub> hubContext,
            IRTCConnectionManager connectionManager)
        {
            _tempDataWrapper = tempDataWrapper;
            _hubContext = hubContext;
            _connectionManager = connectionManager;
        }
        private readonly string _key = NotificationConstants.NotificationKey;

       
        private bool QueueToTempData(Notification notification)
        {
            switch (notification.NotifyTo)
            {
                case NotifyTo.AdminOnly:
                    break;
                case NotifyTo.AllUser:
                    break;
                case NotifyTo.MeOnly:
                    break;
                case NotifyTo.SpecificUsers:
                    break;
            }

            var userConnectionIds =
                _connectionManager.GetUserConnectionIds(ContextResolver.Context.User.Identity.GetIdentityUserId()).GetAwaiter().GetResult();
            _hubContext.Clients.Clients(userConnectionIds.ToArray()).SendAsync("OnNotificationRecieved", notification).GetAwaiter().GetResult();
            return true;
        }

        public bool Success(Notification notification)
        {
            notification.Type = NotificationType.Success;
            return QueueToTempData(notification);
        }

        public bool Error(Notification notification)
        {
            notification.Type = NotificationType.Error;
            return QueueToTempData(notification);
        }

        public bool Info(Notification notification)
        {
            notification.Type = NotificationType.Info;
            return QueueToTempData(notification);
        }

        public bool Warning(Notification notification)
        {
            notification.Type = NotificationType.Warning;
            return QueueToTempData(notification);
        }

        public bool BroadCast(Notification notification)
        {
            _hubContext.Clients.All.SendAsync("OnBroadcastRecieved", notification);
            return true;
        }

        public bool BroadCast(string roles, Notification notification)
        {
            throw new NotImplementedException();
        }

        public bool Notify(string title, string message)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message
            };
            notification.Type = NotificationType.Info;
            return QueueToTempData(notification);
        }

        public bool Notify(string title, string message, NotificationType notificationType)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message
            };
            notification.Type = notificationType;
            return QueueToTempData(notification);
        }

        public bool Notify(string message, NotificationType notificationType)
        {
            var notification = new Notification
            {
                Message = message
            };
            switch (notificationType)
            {
                case NotificationType.Error:
                    notification.Title = "Error";
                    break;
                case NotificationType.Info:
                    notification.Title = "Info";
                    break;
                case NotificationType.Success:
                    notification.Title = "Success";
                    break;
                case NotificationType.Warning:
                    notification.Title = "Warning";
                    break;
            }
            notification.Type = notificationType;
            return QueueToTempData(notification);
        }
    }
}
