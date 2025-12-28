using System.Data.Common;
using Dapper;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Web.Model;

namespace YangOne.Web.Service
{
    internal class Class1
    {
    }
    public interface IUnSubscriptionService
    {
        CrudService<UnSubscription> CrudService { get; set; }
        Task<bool> UnSubscribeEmail(UnSubscription model);
        Task<bool> CheckUserHasUnsubscribed(string userEmail, string unSubType);
    }

    public class UnSubscriptionService : IUnSubscriptionService
    {
        public CrudService<UnSubscription> CrudService { get; set; } = new CrudService<UnSubscription>();
        public async Task<bool> UnSubscribeEmail(UnSubscription model)
        {
            var exist = await CrudService.GetAsync("Where Email=@Email", new { Email = model.Email });
            if (exist != null)
            {
                exist.Informative = model.Informative;
                exist.AllEmail = model.AllEmail;
                exist.Promotional = model.Promotional;
                exist.Transactional = model.Transactional;
                exist.Newsletter = model.Newsletter;
                exist.AutoFill();
                await CrudService.UpdateAsync(exist);
            }
            else
            {
                model.AutoFill();
                await CrudService.InsertAsync(model);
            }

            return true;
        }

        public async Task<bool> CheckUserHasUnsubscribed(string userEmail, string unSubType)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                if (unSubType.ToLower() == "newsletter")
                {

                    return await db.ExecuteScalarAsync<bool>(
                        "SELECT newsletter FROM dbo.UnSubscription  Where  Email=@Email and newsletter=@newsletter  ",
                        new { Email = userEmail, newsletter = true });

                }
                else if (unSubType.ToLower() == "allemail")
                {
                    return await db.ExecuteScalarAsync<bool>(
                        "SELECT newsletter FROM dbo.UnSubscription  Where  Email=@Email and allemail=@allemail  ",
                        new { Email = userEmail, allemail = true });

                }
                else if (unSubType.ToLower() == "transactional")
                {
                    return await db.ExecuteScalarAsync<bool>(
                        "SELECT newsletter FROM dbo.UnSubscription  Where  Email=@Email and transactional=@transactional  ",
                        new { Email = userEmail, transactional = true });
                }
                else if (unSubType.ToLower() == "informative")
                {
                    return await db.ExecuteScalarAsync<bool>("SELECT newsletter FROM dbo.UnSubscription  Where  Email=@Email and informative=@informative  ",
                    new { Email = userEmail, informative = true });
                }
                else if (unSubType.ToLower() == "promotional")
                {
                    return await db.ExecuteScalarAsync<bool>("SELECT newsletter FROM dbo.UnSubscription  Where  Email=@Email and promotional=@promotional  ",
                        new { Email = userEmail, promotional = true });
                }
                else
                {
                    return false;
                }

            }
        }
    }
}
