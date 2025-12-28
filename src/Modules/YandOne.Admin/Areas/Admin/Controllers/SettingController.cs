using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MXTires.Microdata.Core.Intangible;
using YandOne.Admin.ViewModel;
using YangOne.Caching;
using YangOne.Data.Crud.Attribute;
using YangOne.Data.Extension;
using YangOne.Localization;
using YangOne.Security;
using YangOne.Storage;
using YangOne.Web;
using YangOne.Web.Form;
using YangOne.Web.Model;
using YangOne.Web.Notification;
using YangOne.Web.Optimizer;
using YangOne.Web.Security;
using YangOne.Web.Security.API;
using YangOne.Web.Service;

namespace YandOne.Admin.Controllers
{
    [Area("Admin")]
    [Authorize(PolicyConstants.PagePermission)]
    public class SettingController : BaseController
    {
        private readonly ISettingService _settingService;
        private readonly IHostApplicationLifetime _applicationLifetime;
        private readonly INotificationService _notificationService;
        private readonly ILocaleResourceProvider _localeResourceProvider;
        private readonly ICacheService _cacheService;
        private readonly IEnumerable<ICacheService> _cacheServices;
        private readonly ICSPManager _cspManager;
        private readonly IApiConfigService _apiConfigService;
        private readonly IOptimizationConfigService _optimizationConfigService;
        private readonly IFileConfigService _fileConfigService;
        private readonly IAppBasicSecurityService _appBasicSecurityService;
        private readonly IStorageProvider _storageProvider;

        public SettingController(ISettingService settingService, IHostApplicationLifetime applicationLifetime,
            IStorageProvider storageProvider,
            IServiceCollection diService,
            INotificationService notificationService
            , ILocaleResourceProvider localeResourceProvider,ICacheService cacheService,
            IEnumerable<ICacheService> cacheServices 
            ,ICSPManager cspManager
            ,IApiConfigService apiConfigService
            ,IOptimizationConfigService optimizationConfigService
            ,IFileConfigService fileConfigService,
            IAppBasicSecurityService appBasicSecurityService)
        {
            _settingService = settingService;
            _applicationLifetime = applicationLifetime;
            _notificationService = notificationService;
            _localeResourceProvider = localeResourceProvider;
            _cacheService = cacheService;
            _cacheServices = cacheServices;
            _cspManager = cspManager;
            _apiConfigService = apiConfigService;
            _optimizationConfigService = optimizationConfigService;
            _fileConfigService = fileConfigService;
            _appBasicSecurityService = appBasicSecurityService;
            _storageProvider = storageProvider;
            _localeResourceProvider.LookUpGroupAt("Setting");
        }
        [Route("admin/setting")]
        [FriendlyName("Setting List")]
        public async Task<IActionResult> Index()
        {
            return RedirectToAction("Web");
        }
        public async Task<IActionResult> Security()
        {
            return View();
        }
        
        public async Task<string> Shutdown()
        {
            // Later bro
            _applicationLifetime.StopApplication();
            return "Ok";
        }

        [Route("admin/setting/web")]
        [FriendlyName("Web Setting List")]
        public async Task<IActionResult> Web()
        {
            var _setting = await _settingService.CrudService.GetAsync(1);
            ViewData["FormDataSource"] = await GetFormDataSources(_setting.TimeZoneName);
            return View(_setting);
        }

        [HttpPost]
        [Route("admin/setting/web")]
        [FriendlyName("Save New Web Setting")]
        public async Task<IActionResult> Web(Setting model)
        {
           
            if (ModelState.IsValid)
            {
                model.AutoFill();
                model.Description.Trim();
                if (model.LogoFile != null)
                {
                    model.Logo = await _storageProvider.Save("Logo", model.LogoFile);
                }
                try
                {
                   var selectedTimezone= TimeZoneInfo.GetSystemTimeZones()
                        .SingleOrDefault(x => x.StandardName == model.TimeZoneName);
                  
                   TimeSpan ts = selectedTimezone.BaseUtcOffset;
                   if (ts.Hours > 0)
                       model.TimeZoneOffset = "+" + ts.ToString(@"hh\:mm");
                   else
                   {
                       model.TimeZoneOffset = "-" + ts.ToString(@"hh\:mm");
                   }
                }
                catch (Exception e)
                {

                }
                await _settingService.SaveSetting(model);
                _notificationService.Notify(_localeResourceProvider.Get("Success"),
                    _localeResourceProvider.Get("Data has been saved successfully."), NotificationType.Success);
                ViewData["FormDataSource"] = await GetFormDataSources(model.TimeZoneName);
                return View(model);
            }
            else
            {
               
                _notificationService.Notify(_localeResourceProvider.Get("Alert"), _localeResourceProvider.Get("Invalid inputs or missing inputs on submited form."),
                    NotificationType.Warning);
                ModelState.AddModelError("Invalid Setting Values", "Please enter valid values");
                ViewData["FormDataSource"] = await GetFormDataSources(model.TimeZoneName);
                return View(model);
            }

           
        }
        public async Task<IActionResult> Caching()
        {
           
            return View(_cacheServices);
        }
        public async Task<IActionResult> ResetCacheAll()
        {
            _cacheService.Flush();
            return RedirectToAction("Caching");
        }

        private async Task<FormDatasource> GetFormDataSources(string name)
        {
            var formDataSource = new FormDatasource();
            var timeZones = TimeZoneInfo.GetSystemTimeZones();

            formDataSource.SetSource("TimeZoneNames", timeZones.Select(x => new FormInputItem()
            {
                IsSelected = x.StandardName == name,
                //Id = x.BaseUtcOffset,
                Value = x.StandardName.ToString(),
                Label = x.DisplayName
            }));
            return formDataSource;
        }



        #region CSP

        [Route("admin/setting/csp")]
        public async Task<IActionResult> CSP()
        {
            var config = await _cspManager.GetConfigAsync();

            var model = new CspConfigViewModel
            {
                SupportNonce = config.SupportNonce,
                Directives = _cspManager.KnownDirectives
                    .Select(d => new DirectiveViewModel
                    {
                        Name = d,
                        Values = config.Directives.TryGetValue(d, out var list)
                            ? string.Join(", ", list)
                            : string.Empty
                    })
                    .ToList()
            };

            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("admin/setting/csp")]
        public async Task<IActionResult> CSP(CspConfigViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var config = new CspConfig
            {
                SupportNonce = model.SupportNonce
            };

            foreach (var directive in model.Directives)
            {
                if (string.IsNullOrWhiteSpace(directive.Name))
                {
                    continue; // should not happen, but just in case
                }

                var values = (directive.Values ?? string.Empty)
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(v => v.Trim())
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.Ordinal)
                    .ToList();

                // Enforce at least one value
                if (values.Count == 0)
                {
                    // Use same fallback logic as manager
                    if (directive.Name.Equals("object-src", StringComparison.OrdinalIgnoreCase) ||
                        directive.Name.Equals("media-src", StringComparison.OrdinalIgnoreCase))
                    {
                        values.Add("'none'");
                    }
                    else
                    {
                        values.Add("'self'");
                    }
                }

                config.Directives[directive.Name] = values;
            }

            await _cspManager.SaveConfigAsync(config);
            TempData["Message"] = "CSP configuration saved successfully.";

            return RedirectToAction(nameof(CSP));
        }

        #endregion

        #region API Config
        [Route("admin/setting/api")]
        public async Task<IActionResult> APIConfig()
        {
            var config = await _apiConfigService.GetConfigAsync();

            var model = new ApiConfig
            {
                UseEncryption = config.UseEncryption,
                UseObfusication = config.UseObfusication
            };

            return View(model);
        }

        [HttpPost]
        [Route("admin/setting/api")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> APIConfig(ApiConfig model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var config = new ApiConfig
            {
                UseEncryption = model.UseEncryption,
                UseObfusication = model.UseObfusication
            };

            await _apiConfigService.SaveConfigAsync(config);

            return RedirectToAction(nameof(APIConfig));
        }


        #endregion

        #region Optimization

        [HttpGet]
        [Route("admin/setting/optimization")]
        public async Task<IActionResult> OptimizationConfig()
        {
            var config = await _optimizationConfigService.GetConfigAsync();
            return View(config);
        }
        [Route("admin/setting/optimization")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> OptimizationConfig(OptimizationConfig model)
        {
            if (!ModelState.IsValid)
                return View(model);

            await _optimizationConfigService.SaveConfigAsync(model);

            return RedirectToAction(nameof(OptimizationConfig));
        }

        #endregion

        #region AllowedFiles

        [HttpGet]
        [Route("admin/setting/file")]
        public async Task<IActionResult> FileConfig()
        {
            var config = await _fileConfigService.GetConfigAsync();

            var model = new FileConfigViewModel
            {
                FileTypes = config.AllowFileTypes
                    .OrderBy(k => k.Key)
                    .Select(kvp => new FileTypeEntryViewModel
                    {
                        Extension = kvp.Key,
                        MimeTypes = string.Join(',', kvp.Value)
                    })
                    .ToList()
            };

            if (model.FileTypes.Count == 0)
            {
                // Start with one empty row
                model.FileTypes.Add(new FileTypeEntryViewModel());
            }

            return View(model);
        }
        [Route("admin/setting/file")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> FileConfig(FileConfigViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var config = new FileConfig();

            foreach (var entry in model.FileTypes ?? new List<FileTypeEntryViewModel>())
            {
                var ext = (entry.Extension ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(ext))
                    continue;

                var mimes = (entry.MimeTypes ?? string.Empty)
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(v => v.Trim())
                    .Where(v => !string.IsNullOrWhiteSpace(v))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                if (mimes.Count == 0)
                    continue;

                config.AllowFileTypes[ext] = mimes;
            }

            await _fileConfigService.SaveConfigAsync(config);

            return RedirectToAction(nameof(FileConfig));
        }

        #endregion

        #region Basic

        [HttpGet]
        [Route("admin/setting/basic")]
        public async Task<IActionResult> BasicConfig()
        {
            var config = await _appBasicSecurityService.GetConfigAsync();
            return View(config);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Route("admin/setting/basic")]
        public async Task<IActionResult> BasicConfig(AppBasicSecurity model)
        {
            // simple safety checks (optional)
            if (model.OTPExpiryTimeInMinutes <= 0)
            {
                ModelState.AddModelError(nameof(model.OTPExpiryTimeInMinutes),
                    "OTP expiry time must be greater than zero.");
            }

            if (model.PasswordLength < 4)
            {
                ModelState.AddModelError(nameof(model.PasswordLength),
                    "Password length should be at least 4 characters.");
            }

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            await _appBasicSecurityService.SaveConfigAsync(model);

            return RedirectToAction(nameof(BasicConfig));
        }

        #endregion
    }
}