using System.Data.Common;
using System.Reflection;
using Dapper;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Plugin;
using YangOne.Web.Model;

namespace YangOne.Web.Services
{
    public interface IEmailLogService
    {
        CrudService<EmailLog> LogCrudService { get; set; }
    }
    public class EmailLogService : IEmailLogService
    {
        public CrudService<EmailLog> LogCrudService { get; set; } = new CrudService<EmailLog>();
    }
    public class EmailServiceProviderService : IEmailServiceProviderService
    {
        private readonly IEnumerable<IEmailSender> _emailSenders;
        private readonly IEnumerable<IPlugin> _plugins;

        public EmailServiceProviderService(IPluginProvider pluginProvider,IEnumerable<IEmailSender> emailSenders)
        {
            _emailSenders = emailSenders;
            _plugins = pluginProvider.GetPlugins(PluginType.EmailService);
        }

        public async Task<IEmailSender> GetDefaultEmailSender()
        {
            var defaultProvider = await GetDefaultProviderAsync();
            if (defaultProvider == null)
            {
                return _emailSenders.First(o => o.Name.Equals(EmailProviderConstant.Default));
            }

           var defaultPlugin= _plugins.SingleOrDefault(plugin => plugin.Configuration.SystemName.ToLower() == defaultProvider.Name.ToLower());
            var emailSender= defaultPlugin as IEmailSender ;
            return emailSender;
        }
        public CrudService<EmailServiceProvider> ProviderCrudService { get; set; } = new CrudService<EmailServiceProvider>();
      
        public CrudService<EmailServiceProviderSetting> SettingCrudService { get; set; } = new CrudService<EmailServiceProviderSetting>();
        public async Task<bool> SetDefaultProviderAsync(int id)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(
                    "Update EmailServiceProvider set isdefault=@isDefault;Update EmailServiceProvider set isDefault=@Active where EmailServiceProviderId=@Id",
                    new { isDefault = false, Active = true, Id = id });
                return true;
            }
        }
        public async Task<EmailServiceProvider> GetDefaultProviderAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
               return await db.QueryFirstOrDefaultAsync<EmailServiceProvider>(
                    "Select * from  EmailServiceProvider  Where IsDefault=@IsDefault and IsActive=@IsActive",
                    new { IsDefault = true, IsActive = true});
              
            }
        }

        public async Task<bool> UpdateSettings(List<EmailServiceProviderSetting> settings)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                using (var tran = await db.BeginTransactionAsync())
                {
                    try
                    {
                        var providerId = settings.First().EmailServiceProviderId;
                        await db.ExecuteAsync(
                            @"delete from EmailServiceProviderSetting where EmailServiceProviderId=@Id",
                            new { Id = providerId }, tran);

                        foreach (var setting in settings)
                        {
                            setting.EmailServiceProviderSettingId = 0;
                            await SettingCrudService.InsertAsync<int>(db,setting, tran,30);
                        }

                        await tran.CommitAsync();
                    }
                    catch
                    {
                        await  tran.RollbackAsync();
                        throw;
                    }
                }
            }

            return true;
        }

        public async Task<bool> UpdateStatus(EmailServiceProvider model)
        {
            if (model.IsDefault)
            {
                var dbFactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbFactory.GetConnection())
                {
                    await db.OpenAsync();
                     await db.ExecuteAsync(
                        "update EmailServiceProvider set isDefault=@OldValue;" +
                        "update EmailServiceProvider set isDefault=@IsDefault ,IsActive=@IsActive  Where EmailServiceProviderId=@EmailServiceProviderId ",
                        new { IsDefault = true, IsActive = true, OldValue=false, EmailServiceProviderId=model.EmailServiceProviderId });
                    return true;
                }
            }
            else
            {
                var dbFactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    await db.ExecuteAsync(
                        "update EmailServiceProvider set isDefault=@IsDefault ,IsActive=@IsActive  Where EmailServiceProviderId=@EmailServiceProviderId ",
                        new { IsDefault = model.IsDefault, IsActive = model.IsActive,EmailServiceProviderId = model.EmailServiceProviderId });
                    return true;
                }
            }
        }

        public async Task<IEnumerable<EmailServiceProviderSetting>> GetSettings(int emailServiceProviderId)
        {
            return await SettingCrudService.GetListAsync(@"Where EmailServiceProviderId=@emailServiceProviderId", new { emailServiceProviderId });
        }
        public async Task<IEnumerable<EmailServiceProviderSetting>> GetSettings(string name)
        {
            var emailServiceProvider = ProviderCrudService.Get("Where Name=@Name", new {Name = name});
            return await SettingCrudService.GetListAsync(@"Where EmailServiceProviderId=@EmailServiceProviderId", new { emailServiceProvider.EmailServiceProviderId });
        }
        public T GetSettings<T>(int emailServiceProviderId) where T : class
        {

            try
            {

                // var dbfactory = DbFactoryProvider.GetFactory();

                IEnumerable<EmailServiceProviderSetting> settings = GetSettings(emailServiceProviderId).Result;


                var settingObj = Activator.CreateInstance<T>();
                var settingObjType = settingObj.GetType();
                PropertyInfo[] pi = settingObjType.GetProperties();
                foreach (var setting in settings)
                {
                    var prop = pi.SingleOrDefault(z => z.Name == setting.ProviderKey);
                    if (prop != null)
                    {
                        Type tPropertyType = settingObjType.GetProperty(prop.Name).PropertyType;
                        // Fix nullables...
                        Type newT = Nullable.GetUnderlyingType(tPropertyType) ?? tPropertyType;
                        object newValue = Convert.ChangeType(setting.ProviderValue, newT);
                        settingObj.GetType().GetProperty(prop.Name).SetValue(settingObj, newValue, null);
                    }
                }


                return settingObj as T;

            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public T GetSettings<T>(string name) where T : class
        {

            try
            {

                // var dbfactory = DbFactoryProvider.GetFactory();

                IEnumerable<EmailServiceProviderSetting> settings = GetSettings(name).Result;


                var settingObj = Activator.CreateInstance<T>();
                var settingObjType = settingObj.GetType();
                PropertyInfo[] pi = settingObjType.GetProperties();
                foreach (var setting in settings)
                {
                    var prop = pi.SingleOrDefault(z => z.Name == setting.ProviderKey);
                    if (prop != null)
                    {
                        Type tPropertyType = settingObjType.GetProperty(prop.Name).PropertyType;
                        // Fix nullables...
                        Type newT = Nullable.GetUnderlyingType(tPropertyType) ?? tPropertyType;
                        object newValue = Convert.ChangeType(setting.ProviderValue, newT);
                        settingObj.GetType().GetProperty(prop.Name).SetValue(settingObj, newValue, null);
                    }
                }


                return settingObj as T;

            }
            catch (Exception ex)
            {

                throw ex;
            }
        }
        public async Task<bool> SaveSetting<T>(T setting, int emailServiceProviderId)
        {

            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var type = typeof(T);
                var props = type.GetProperties();
                using (var tran =await db.BeginTransactionAsync())
                {
                    try
                    {

                        foreach (var prop in props)
                        {
                            var esetting = new EmailServiceProviderSetting()
                            {
                                EmailServiceProviderSettingId = 0,
                                EmailServiceProviderId = emailServiceProviderId,
                                ProviderKey = prop.Name,
                                ProviderValue = prop.GetValue(setting, null).ToString()
                            };

                            await SettingCrudService.InsertAsync<int>(db,esetting,tran,30);
                        }
                        await tran.CommitAsync();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        await tran.RollbackAsync();
                        throw ex;
                    }
                }
            }

        }

        public async Task<int> InsertOrSave(EmailServiceProvider model)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            model.AutoFill();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                if (model.IsDefault)
                {
                    await db.ExecuteAsync("update EmailServiceProvider set IsDefault=0");
                }

                if (model.EmailServiceProviderId > 0)
                {
                    await db.ExecuteAsync(
                        @"update EmailServiceProvider set  Description=@Description, Image=@Image, " +
                        "IsActive=@IsActive, IsDefault=@IsDefault where EmailServiceProviderId=@EmailServiceProviderId",
                        new { model.Name, model.Description, model.Image, model.IsActive, model.IsDefault, model.EmailServiceProviderId });
                    return model.EmailServiceProviderId;
                }

                var existing = await db.QueryFirstOrDefaultAsync<int>(
                    "select EmailServiceProviderId from EmailServiceProvider where Name=@Name",
                    new { model.Name });

                if (existing > 0)
                {
                    await db.ExecuteAsync(
                        "update EmailServiceProvider set Description=@Description, Image=@Image, " +
                        "IsActive=@IsActive, IsDefault=@IsDefault where EmailServiceProviderId=@Id",
                        new { model.Description, model.Image, model.IsActive, model.IsDefault, Id = existing });
                    return existing;
                }

                var newId = await db.ExecuteScalarAsync<int>(
                    "insert into EmailServiceProvider(Name,Image,Description,IsActive,IsDefault,AddedOn,AddedBy) " +
                    "values (@Name,@Image,@Description,@IsActive,@IsDefault,@AddedOn,@AddedBy); select scope_identity();",
                    new { model.Name, model.Description, model.Image, model.IsActive, model.IsDefault,
                        AddedOn = DateTime.UtcNow, AddedBy = model.AddedBy });

                if (model.EmailServiceProviderSettings?.Count > 0)
                {
                    foreach (var setting in model.EmailServiceProviderSettings)
                    {
                        setting.EmailServiceProviderSettingId = 0;
                        setting.EmailServiceProviderId = newId;
                        await SettingCrudService.InsertAsync<int>(setting);
                    }
                }

                return newId;
            }
        }
        public async Task<bool> DeleteEmailService(string name)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var isDefault = await db.QueryFirstOrDefaultAsync<bool>(
                    "select IsDefault from EmailServiceProvider where Name=@Name",
                    new { Name = name });

                if (isDefault)
                    return false;

                await db.ExecuteAsync("Delete es from EmailServiceProviderSetting as es " +
                                      "inner join EmailServiceProvider as e on e.EmailServiceProviderId = es.EmailServiceProviderId " +
                                      "where e.Name = @Name ;" +
                                      " Delete From EmailServiceProvider Where Name=@Name;",
                    new { Name = name });
                return true;
            }
        }


    }
}
