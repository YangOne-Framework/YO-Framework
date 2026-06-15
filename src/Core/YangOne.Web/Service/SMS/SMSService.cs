using System.Data.Common;
using System.Reflection;
using Dapper;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Log;
using YangOne.Plugin;
using YangOne.Web.Model;
using YangOne.Web.Services;

namespace YangOne.Web.Service
{

    public interface ISMSLogService
    {
        CrudService<SMSLog> LogCrudService { get; set; }
    }

    public class SMSLogService : ISMSLogService
    {
        public CrudService<SMSLog> LogCrudService { get; set; } = new CrudService<SMSLog>();
    }
    public class SMSService : ISMSService
    {
        private readonly ILogger _logger;
        private readonly IEnumerable<IPlugin> _plugins;

        public SMSService(IPluginProvider pluginProvider ,ILogger logger)
        {
            _logger = logger;
            _plugins = pluginProvider.GetPlugins(PluginType.SmsService);
        }
        public CrudService<SMSGateway> GatewayCrudService { get; set; }=new CrudService<SMSGateway>();
       
        public CrudService<SMSGatewaySetting> SettingCrudService { get; set; }=new CrudService<SMSGatewaySetting>();
        public async Task<ISmsSender> GetDefaultSmsSender()
        {
            var defaultProvider = await GetDefaultProviderAsync();
            if (defaultProvider == null)
            {
                //return new SmsSender(_logger);
            }

            var defaultPlugin = _plugins.SingleOrDefault(plugin => plugin.Configuration.SystemName.ToLower() == defaultProvider.Name.ToLower());
            var smsService = defaultPlugin as ISmsSender;
            return smsService;
        }

        public async Task<IEnumerable<SMSGatewaySetting>> GetSettings(int smsGatewayId)
        {
            return await SettingCrudService.GetListAsync(@"Where SmsGatewayId=@smsGatewayId", new { smsGatewayId });

        }

        public async Task<IEnumerable<SMSGatewaySetting>> GetSettings(string name)
        {
            var provider = GatewayCrudService.Get("Where Name=@Name", new {Name = name});
            return await SettingCrudService.GetListAsync(@"Where SmsGatewayId=@SmsGatewayId", new { provider.SMSGatewayId });
        }

        public T GetSettings<T>(int smsGatewayId) where T : class
        {
            try
            {

                // var dbfactory = DbFactoryProvider.GetFactory();

                IEnumerable<SMSGatewaySetting> settings = GetSettings(smsGatewayId).Result;


                var settingObj = Activator.CreateInstance<T>();
                var settingObjType = settingObj.GetType();
                PropertyInfo[] pi = settingObjType.GetProperties();
                foreach (var setting in settings)
                {
                    var prop = pi.SingleOrDefault(z => z.Name == setting.GatewayKey);
                    if (prop != null)
                    {
                        Type tPropertyType = settingObjType.GetProperty(prop.Name).PropertyType;
                        // Fix nullables...
                        Type newT = Nullable.GetUnderlyingType(tPropertyType) ?? tPropertyType;
                        object newValue = Convert.ChangeType(setting.GatewayValue, newT);
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
                IEnumerable<SMSGatewaySetting> settings = GetSettings(name).Result;

                var settingObj = Activator.CreateInstance<T>();
                var settingObjType = settingObj.GetType();
                PropertyInfo[] pi = settingObjType.GetProperties();
                foreach (var setting in settings)
                {
                    var prop = pi.SingleOrDefault(z => z.Name == setting.GatewayKey);
                    if (prop != null)
                    {
                        Type tPropertyType = settingObjType.GetProperty(prop.Name).PropertyType;
                        Type newT = Nullable.GetUnderlyingType(tPropertyType) ?? tPropertyType;
                        object newValue = Convert.ChangeType(setting.GatewayValue, newT);
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

        public async Task<bool> SaveSetting<T>(T setting, int smsGatewayId)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                var type = typeof(T);
                var props = type.GetProperties();
                using (var tran = db.BeginTransaction())
                {
                    try
                    {

                        foreach (var prop in props)
                        {
                            var esetting = new SMSGatewaySetting()
                            {
                                SMSGatewaySettingId = 0,
                                SMSGatewayId = smsGatewayId,
                                GatewayKey = prop.Name,
                                GatewayValue = prop.GetValue(setting, null).ToString()
                            };

                            await SettingCrudService.InsertAsync(esetting);
                        }
                        tran.Commit();
                        return true;
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        throw ex;
                    }
                }
            }
        }

        public async Task<bool> SetDefaultProviderAsync(int id)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                await db.ExecuteAsync(
                    "Update dbo.SmsGateway set isdefault=@isDefault;Update SmsGateway set isDefault=@Active where SmsGatewayId=@Id",
                    new { isDefault = false, Active = true, Id = id });
                return true;
            }
        }

        public async Task<SMSGateway> GetDefaultProviderAsync()
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                return await db.QueryFirstOrDefaultAsync<SMSGateway>(
                    "Select * from  dbo.SmsGateway  Where IsDefault=@IsDefault and IsActive=@IsActive",
                    new { IsDefault = true, IsActive = true });

            }
        }

        public async Task<bool> UpdateStatus(SMSGateway model)
        {
            if (model.IsDefault)
            {
                var dbFactory = DbFactoryProvider.GetFactory();
                using (var db = (DbConnection)dbFactory.GetConnection())
                {
                    await db.OpenAsync();
                    await db.ExecuteAsync(
                        "update dbo.SmsGateway set isDefault=@OldValue;" +
                        "update dbo.SmsGateway set isDefault=@IsDefault ,IsActive=@IsActive  Where SMSGatewayId=@SMSGatewayId ",
                        new { IsDefault = true, IsActive = true, OldValue = false, SMSGatewayId = model.SMSGatewayId });
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
                        "update dbo.SmsGateway set isDefault=@IsDefault ,IsActive=@IsActive  Where SMSGatewayId=@SMSGatewayId ",
                        new { IsDefault = model.IsDefault, IsActive = model.IsActive, SMSGatewayId = model.SMSGatewayId });
                    return true;
                }
            }
        }

        public async Task<bool> UpdateSettings(List<SMSGatewaySetting> settings)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();
                using (var tran = await db.BeginTransactionAsync())
                {
                    try
                    {
                        var providerId = settings.First().SMSGatewayId;
                        await db.ExecuteAsync(
                            @"delete from SMSGatewaySetting where SMSGatewayId=@Id",
                            new { Id = providerId }, tran);

                        foreach (var setting in settings)
                        {
                            setting.SMSGatewaySettingId = 0;
                            await SettingCrudService.InsertAsync<int>(db, setting, tran, 30);
                        }

                        await tran.CommitAsync();
                    }
                    catch
                    {
                        await tran.RollbackAsync();
                        throw;
                    }
                }
            }

            return true;
        }

        public async Task<int> InsertOrSave(SMSGateway model)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            model.AutoFill();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                if (model.IsDefault)
                {
                    await db.ExecuteAsync("update SMSGateway set IsDefault=0");
                }

                if (model.SMSGatewayId > 0)
                {
                    await db.ExecuteAsync(
                        @"update SMSGateway set Description=@Description, Image=@Image, " +
                        "IsActive=@IsActive, IsDefault=@IsDefault where SMSGatewayId=@SMSGatewayId",
                        new { model.Name, model.Description, model.Image, model.IsActive, model.IsDefault, model.SMSGatewayId });
                    return model.SMSGatewayId;
                }

                var existing = await db.QueryFirstOrDefaultAsync<int>(
                    "select SMSGatewayId from SMSGateway where Name=@Name",
                    new { model.Name });

                if (existing > 0)
                {
                    await db.ExecuteAsync(
                        "update SMSGateway set Description=@Description, Image=@Image, " +
                        "IsActive=@IsActive, IsDefault=@IsDefault where SMSGatewayId=@Id",
                        new { model.Description, model.Image, model.IsActive, model.IsDefault, Id = existing });
                    return existing;
                }

                var newId = await db.ExecuteScalarAsync<int>(
                    "insert into SMSGateway(Name,Image,Description,IsActive,IsDefault,AddedOn,AddedBy) " +
                    "values (@Name,@Image,@Description,@IsActive,@IsDefault,@AddedOn,@AddedBy); select scope_identity();",
                    new { model.Name, model.Description, model.Image, model.IsActive, model.IsDefault,
                        AddedOn = DateTime.UtcNow, AddedBy = model.AddedBy });

                if (model.SMSGatewaySettings?.Count > 0)
                {
                    foreach (var setting in model.SMSGatewaySettings)
                    {
                        setting.SMSGatewaySettingId = 0;
                        setting.SMSGatewayId = newId;
                        await SettingCrudService.InsertAsync<int>(setting);
                    }
                }

                return newId;
            }
        }

        public async Task<bool> DeleteSmsService(int id)
        {
            var dbFactory = DbFactoryProvider.GetFactory();
            using (var db = (DbConnection)dbFactory.GetConnection())
            {
                await db.OpenAsync();

                var isDefault = await db.QueryFirstOrDefaultAsync<bool>(
                    "select IsDefault from SMSGateway where SMSGatewayId=@Id",
                    new { Id = id });

                if (isDefault)
                    return false;

                await db.ExecuteAsync("Delete gs from SMSGatewaySetting as gs " +
                                      "inner join SMSGateway as g on g.SMSGatewayId = gs.SMSGatewayId " +
                                      "where g.SMSGatewayId = @Id ;" +
                                      " Delete From SMSGateway Where SMSGatewayId=@Id;",
                    new { Id = id });
                return true;
            }
        }
    }
}