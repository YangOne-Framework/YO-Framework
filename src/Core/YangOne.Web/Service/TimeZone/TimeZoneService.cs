

using System.Data.Common;
using Dapper;
using YangOne.Data;
using YangOne.Web.Model;
using TimeZone =YangOne.Web.Model.Timezone;

namespace YangOne.Web.Service;

public class TimeZoneService : ITimeZoneService
  {
      public CrudService<Timezone> TimeZoneCrudService { get; set; } = new CrudService<Timezone>();

      public async Task<TimeZone> SaveUserTimeZone(long userId, int timeZoneId)
      {
          var dbFactory = DbFactoryProvider.GetFactory();
          using (var db = (DbConnection)dbFactory.GetConnection())
          {
              await db.OpenAsync();
              await db.ExecuteAsync(@" update dbo.AppUser set TimeZoneId=@TimeZoneId where IdentityUserId=@IdentityUserId",
                 new
                 {
                     IdentityUserId = userId,
                     TimeZoneId = timeZoneId

                 });


          }

          return await TimeZoneCrudService.GetAsync(timeZoneId);
      }

      public async Task<TimeZone> CheckUserHasTimeZone(long userId)
      {
          var dbFactory = DbFactoryProvider.GetFactory();
          using (var db = (DbConnection)dbFactory.GetConnection())
          {
              await db.OpenAsync();
              var tz = await db.ExecuteScalarAsync<int>(@" select TimeZoneId from  dbo.AppUser  where IdentityUserId=@IdentityUserId",
                   new
                   {
                       IdentityUserId = userId

                   });
              if (tz > 0)
                  return await TimeZoneCrudService.GetAsync(tz);
              else return null;

          }


      }

      public async Task<IEnumerable<TimeZone>> GetAllTimeZones()
      {
          return await TimeZoneCrudService.GetListAsync();
      }
  }