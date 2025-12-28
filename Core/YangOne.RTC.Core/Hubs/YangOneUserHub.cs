using Microsoft.AspNetCore.SignalR;
using YangOne.Web.Notification;

namespace YangOne.RTC.Hubs;

public class YangOneUserHub : BaseHub
{
    public YangOneUserHub(IRTCConnectionManager connectionManager) : base(connectionManager)
    {
    }
    public Task BroadcastMessage(Notification notification)
    {
        //TODO lock persistantly
        return Clients.All.SendAsync("OnBroadcastRecieve", notification);
        // return Clients.All.BroadcastMessage(notification);
    }
    public async Task NotityMe(long userId, Notification notification)
    {
        var selfConnection = Context.ConnectionId;
        var connectionIds = await ConnectionManager.GetUserConnectionIds(userId);
        await Clients.Users((IReadOnlyList<string>)connectionIds).SendAsync("OnNotificationRecieved", notification);
        //return Clients.User(userId).BroadcastMessage(notification);

    }
    public async Task NotityUser(long userId, Notification notification)
    {

        var connectionIds = await ConnectionManager.GetUserConnectionIds(userId);
        await Clients.Users((IReadOnlyList<string>)connectionIds).SendAsync("OnNotificationRecieved", notification);
        //return Clients.User(userId).BroadcastMessage(notification);

    }
    public async Task NotifyGroup(string group, Notification notification)
    {
        // var connectionIds = await ConnectionManager.GetUserConnectionIdsByGroup(group);
        await Clients.Group(group).SendAsync("OnNotificationRecieved", notification);
        //return Clients.User(userId).BroadcastMessage(notification);

    }
    public async Task NofifyToRole(string roleName, Notification notification)
    {
        var connectionIds = await ConnectionManager.GetUserConnectionIdsByRoles(roleName);
        await Clients.Users((IReadOnlyList<string>)connectionIds).SendAsync("OnNotificationRecieved", notification);
        // return Clients.All.onNofify(notification);
    }
}