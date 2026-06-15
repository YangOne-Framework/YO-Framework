using YangOne.Data;
using YangOne.Web.Model;
namespace YangOne.Web.Service;
public interface ITimeZoneService
{
    CrudService<Timezone> TimeZoneCrudService { get; set; }
    Task<Timezone> SaveUserTimeZone(long userId, int timeZoneId);
    Task<Timezone> CheckUserHasTimeZone(long userId);
    Task<IEnumerable<Timezone>> GetAllTimeZones();
}