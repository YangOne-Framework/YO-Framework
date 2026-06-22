// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.SignalR;
using YangOne.Identity.Extensions;
using YangOne.Web;

namespace YangOne.RTC.Hubs
{    

    //[Authorize(JwtBearerDefaults.AuthenticationScheme)]
    //[Authorize]
    /// <summary>
    /// Base SignalR hub that handles connection lifecycle and user tracking
    /// </summary>
    public class BaseHub : Hub
    {
        public readonly IRTCConnectionManager ConnectionManager;
        
        public BaseHub(IRTCConnectionManager connectionManager)
        {
            ConnectionManager = connectionManager;
        }

        public override async Task OnConnectedAsync()
        {
            string connectionId = Context.ConnectionId;
            var rtcUser = new RTCUser();
            var context = ContextResolver.Context;
            string ua = context.Request.Headers["User-Agent"].ToString();
            rtcUser.UserDevice = ua;
            rtcUser.ConnectionIds.Add(connectionId);
            rtcUser.IdentityUserId = context.User.Identity.GetIdentityUserId();
            rtcUser.SessionId = context.Session.Id;

            rtcUser.HubNames.Add(this.GetType().Name);
            rtcUser.IsFromWeb = true;
            rtcUser.UserRoles = string.Join(',', context.User.Identity.GetRoles());
            rtcUser.ConnectionId = connectionId;
            ConnectionManager.AddUser(rtcUser);

            try
            {
                var status = await ConnectionManager.GetOnlineUserStatus();
                await Clients.All.SendAsync("OnUserChange", status);
            }
            catch
            {
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            ConnectionManager.RemoveUser(Context.ConnectionId);
            try
            {
                var status = await ConnectionManager.GetOnlineUserStatus();
                await Clients.All.SendAsync("OnUserChange", status);
            }
            catch
            {
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
