using YangOne.Data;

namespace YangOne.RTC
{
    public interface IRTCUserService: IRTCConnectionManager
    {
        CrudService<RTCUser> CrudService { get; set; }

    }
}