using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using YangOne.Caching;
using YangOne.Data.Crud.Attribute;
using YangOne.Data.Extension;
using YangOne.Localization;
using YangOne.Storage;
using YangOne.Web;
using YangOne.Web.Form;
using YangOne.Web.Model;
using YangOne.Web.Notification;
using YangOne.Web.Service;

namespace YandOne.Admin.Controllers;

public class SecurityController : BaseController
{
    private readonly ISettingService _settingService;
    private readonly IHostApplicationLifetime _applicationLifetime;
    private readonly INotificationService _notificationService;
    private readonly ILocaleResourceProvider _localeResourceProvider;
    private readonly ICacheService _cacheService;
    private readonly IEnumerable<ICacheService> _cacheServices;
    private readonly IStorageProvider _storageProvider;

    public SecurityController(ISettingService settingService, IHostApplicationLifetime applicationLifetime,
        IStorageProvider storageProvider,
        IServiceCollection diService,
        INotificationService notificationService
        , ILocaleResourceProvider localeResourceProvider, ICacheService cacheService, IEnumerable<ICacheService> cacheServices)
    {
        _settingService = settingService;
        _applicationLifetime = applicationLifetime;
        _notificationService = notificationService;
        _localeResourceProvider = localeResourceProvider;
        _cacheService = cacheService;
        _cacheServices = cacheServices;
        _storageProvider = storageProvider;
        _localeResourceProvider.LookUpGroupAt("Setting");
    }
   
}