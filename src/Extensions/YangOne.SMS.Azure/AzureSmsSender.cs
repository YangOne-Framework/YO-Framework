using System;
using System.Collections.Generic;
using System.Composition;
using System.Reflection;
using System.Threading.Tasks;
using Azure.Communication.Sms;
using Newtonsoft.Json;
using NPOI.SS.Formula.Functions;
using WholisticMinds.Caching;
using WholisticMinds.Data.Extension;
using WholisticMinds.Log;
using WholisticMinds.Plugin;
using WholisticMinds.Web;
using WholisticMinds.Web.Model;
using WholisticMinds.Web.Service;

namespace Azure.SMSSender
{
    
    public class AzureSmsSender : ISmsSender
    {
        public AzureSmsSender()
        {
           
        }
        public string Name { get; } = "Azure SMS Sender";
        public async  Task SendSmsAsync(string number, string message)
        {
            var log = new SMSLog()
            {
                From = this.Name,
                To = number,
                Body = message,
                SentDate = DateTime.Now,
                DeliveredDate = DateTime.Now
            };
            var _smsLogService = (ISMSLogService)ContextResolver.Context.RequestServices.GetService(typeof(ISMSLogService));
            var _cacheService = (ICacheService)ContextResolver.Context.RequestServices.GetService(typeof(ICacheService));
            var _smsService = (ISMSService)ContextResolver.Context.RequestServices.GetService(typeof(ISMSService));
            try
            {
               
                
              
               
                log.AutoFill();

                log.SMSLogId = await _smsLogService.LogCrudService.InsertAsync<long>(log);
                var setting=await _cacheService.GetAsync<AzureSmsSetting>("SMSSETTING", async ()=>
                {
                    return  _smsService.GetSettings<AzureSmsSetting>(this.Name);
                },TimeSpan.FromSeconds(30));
                //xxlZvX+EknYqRKmyXeqPNJiuhrsLtXfgNLGUGaZpVkx0p9e31jF9p63vznJzKxNGrZZBs2XR10VHzCj47NfQTA==
                string connectionString = $"endpoint=https://wm-sms.communication.azure.com/;accesskey={setting.AccessKey}";
                SmsClient smsClient = new SmsClient(connectionString);

                //to: "+18595778624",

                var d = await smsClient.SendAsync(from: setting.FromNumber,
                    to: number,
                    message: message,
                    options: new SmsSendOptions(enableDeliveryReport: true) { Tag = "OTP" });
                if (d.Value.Successful)
                {
                    log.IsSent = true;
                    log.DeliveredDate = DateTime.Now;
                    await _smsLogService.LogCrudService.UpdateAsync(log);
                }
                else
                {
                    log.IsSent = false;
                    log.DeliveredDate = DateTime.Now;
                    log.GatewayResponse =JsonConvert.SerializeObject(d);
                    await _smsLogService.LogCrudService.UpdateAsync(log);
                    throw new Exception($"Unable to send with {d.Value.HttpStatusCode} status code");
                }
            }
            catch (Exception e)
            {
                log.IsSent = false;
                log.DeliveredDate = DateTime.Now;
                log.GatewayResponse = JsonConvert.SerializeObject(e);
                await _smsLogService.LogCrudService.UpdateAsync(log);
                var _logger = (ILogger)ContextResolver.Context.RequestServices.GetService(typeof(ILogger));
                _logger.Log(LogType.Error, () => e.Message, e);
                
            }
           

        }

    
    }
}