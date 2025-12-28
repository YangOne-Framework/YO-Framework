using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using YangOne.Data.Crud.Attribute;
using YangOne.Localization;
using YangOne.Plugin;
using YangOne.Web;
using YangOne.Web.Notification;
using YangOne.Web.Security;
using YangOne.Web.Services;

namespace YandOne.Admin.Controllers
{
   
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class EmailServiceProviderController : BaseController
    {
        private readonly IEmailServiceProviderService _emailServiceProviderService;
        private readonly IHostApplicationLifetime _applicationLifetime;
        private readonly IEnumerable<IPlugin> _plugins;
        private readonly IPluginProvider _pluginProvider;
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;

        public EmailServiceProviderController(IEmailServiceProviderService emailServiceProviderService,IHostApplicationLifetime applicationLifetime,
            IPluginProvider pluginProvider,
            INotificationService  notificationService,ILocaleResourceProvider localeResourceProvider)
        {
           
            _emailServiceProviderService = emailServiceProviderService;
            _applicationLifetime = applicationLifetime;
            _pluginProvider = pluginProvider;
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;
            _plugins = _pluginProvider.Plugins;
            _localeResourceProvider.LookUpGroupAt("EmailService");
        }

        [Route("admin/emailservice")]
        [FriendlyName("Email Service List")]
        public async Task<ActionResult> Index()
        {
            if (_plugins != null)
            {
                var emailSenders =
                    _plugins.Where(e => e.Configuration.PluginType == PluginType.EmailService).ToList();

               var installedEmailServiceProviders = await _emailServiceProviderService.ProviderCrudService.GetListAsync();

               var emailServiceProviders = emailSenders.Select(e =>
                {
                    if (installedEmailServiceProviders.Any(x => x.Name == e.SystemName && x.IsActive==true))
                    {
                        e.Configuration.IsInstalled = true;
                        
                        return e;
                    }
                    else
                    {
                        return e;
                    }
                }).ToList();

                return View(emailServiceProviders);
            }
            return View(new List<IPlugin>());
        }

        [Route("admin/emailservice/setting/{sysName}")]
        [Route("admin/emailservice/setting")]
        [FriendlyName("Email Service Setting")]
        public async Task<ActionResult> Setting([FromQuery][FromRoute]string sysName)
        {
            if (string.IsNullOrEmpty(sysName))
                return Redirect("/page-not-found");

            return View(new EmailServiceProvider{Name = sysName});
        }


        [HttpPost]
        public async Task<JsonResult> UpdateSetting(List<EmailServiceProviderSetting> settings)
        {
            try
            {
                await _emailServiceProviderService.UpdateSettings(settings);
                _notificationService.Notify(_localeResourceProvider.Get("Success"),
                    _localeResourceProvider.Get("Data has been saved successfully."), NotificationType.Success);

                return Json(new
                {
                    Code = 200,
                    Data = true,
                    Message = ""
                }
                    );
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    Code = 400,
                    Message = ex.Message
                }
                    );
            }

        }

        [HttpPost]
        public async Task<JsonResult> GetSetting(EmailServiceProvider model)
        {
            try
            {
                var data = await _emailServiceProviderService.GetSettings(model.EmailServiceProviderId);
                return Json(new
                {
                    Code = 200,
                    Data = data,
                    Message = ""
                }
                    );
            }
            catch (Exception ex)
            {
                return Json(new
                {
                    Code = 400,
                    Message = ex.Message
                }
                    );
            }

        }


    }
}