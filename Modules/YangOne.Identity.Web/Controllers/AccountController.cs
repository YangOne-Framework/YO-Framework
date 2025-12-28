using System.Text.RegularExpressions;
using System.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using YangOne.Caching;
using YangOne.Configuration;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Identity;
using YangOne.Identity.Dto;
using YangOne.Identity.Model;
using YangOne.Identity.Service;
using YangOne.Identity.Web;
using YangOne.Identity.Web.ViewModel;
using YangOne.Localization;
using YangOne.Log;
using YangOne.OTP.Service;
using YangOne.Web;
using YangOne.Web.Security;
using YangOne.Web.Service;
using YangOne.Web.Services;
using IdentityUser = YangOne.Identity.Model.IdentityUser;

[AllowAnonymous]
public class AccountController : Controller
{



    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAppUserService _appUserService;
    private readonly YangOneAppConfig _kachuwaConfig;
    private readonly ILocaleResourceProvider _localeResourceProvider;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _hostingEnvironment;
    private readonly IEmailServiceProviderService _emailServiceProviderService;
    private IEmailSender _emailSender;
    private readonly ISettingService _settingService;
    private readonly IOTPService _otpService;
    private readonly ICacheService _cacheService;
    private readonly IEmailTemplateService _emailTemplateService;
    private readonly IUnSubscriptionService _unSubscriptionService;
    private readonly ISmsSender _smsSender;
    private readonly ILogger _logger;
    private readonly ILoginHistoryService _loginHistoryService;
    private readonly IUserDeviceService _deviceService;

    public AccountController(


         UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        IHttpContextAccessor httpContextAccessor
        , IAppUserService appUserService
        , IOptionsSnapshot<YangOneAppConfig> kachuwaConfig,
        ILocaleResourceProvider localeResourceProvider,
        IConfiguration configuration,
        IWebHostEnvironment hostingEnvironment,
        IEmailServiceProviderService emailServiceProviderService,
        ILogger logger,
        ILoginHistoryService loginHistoryService,
        IUserDeviceService deviceService,
       ISettingService settingService,
        IOTPService otpService,
        ISMSService smsService,
         ICacheService cacheService,
         IEmailTemplateService emailTemplateService,
         IUnSubscriptionService unSubscriptionService

    )
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _httpContextAccessor = httpContextAccessor;
        _appUserService = appUserService;
        _kachuwaConfig = kachuwaConfig.Value;
        _localeResourceProvider = localeResourceProvider;
        _configuration = configuration;
        _hostingEnvironment = hostingEnvironment;
        _emailServiceProviderService = emailServiceProviderService;
        _logger = logger;
        _loginHistoryService = loginHistoryService;
        _deviceService = deviceService;
        _emailSender = emailServiceProviderService.GetDefaultEmailSender().Result ?? null;
        _settingService = settingService;
        _otpService = otpService;
        _cacheService = cacheService;
        _emailTemplateService = emailTemplateService;
        _unSubscriptionService = unSubscriptionService;
        _smsSender = smsService.GetDefaultSmsSender().Result ?? null;
    }

    [HttpGet]
    [AllowAnonymous]
    [Route("account/verifyuser")]
    public async Task<IActionResult> VerifyUserFromToken(string token, string returnUrl)
    {
        var authenticationService = HttpContext.RequestServices.GetService<IAuthenticationService>();
        var result = await authenticationService.AuthenticateAsync(HttpContext, JwtBearerDefaults.AuthenticationScheme);
        if (result.Succeeded)
        {
            var v = result.Principal.Claims.SingleOrDefault(x => x.Type == "IdUid");

            var u = await _userManager.FindByIdAsync(v.Value);
            await _signInManager.SignInAsync(u, true);
        }
        if (!string.IsNullOrEmpty(returnUrl))
            return Redirect(returnUrl);
        else
        {
            return Redirect("/");
        }
    }

    /// <summary>
    /// Entry point into the login workflow
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Login(string returnUrl = "/user/dashboard", string msg = "")
    {
        // build a model so we know what to show on the login page
        var vm = await BuildLoginViewModelAsync(returnUrl);


        ViewBag.MSG = msg;
        return View(vm);
    }

    /// <summary>
    /// Handle postback from username/password login
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginInputModel model)
    {


        if (ModelState.IsValid)
        {
            if (model.Username.IndexOf('@') > -1)
            {
                //Validate email format
                string emailRegex = @"^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}" +
                                    @"\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\" +
                                    @".)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$";
                Regex re = new Regex(emailRegex);
                if (!re.IsMatch(model.Username))
                {
                    ModelState.AddModelError("Username", _localeResourceProvider.Get("Account.Error.InvalidEmail"));
                }
            }
            else
            {
                //validate Username format
                string emailRegex = @"^[a-zA-Z0-9]*$";
                Regex re = new Regex(emailRegex);
                if (!re.IsMatch(model.Username))
                {
                    ModelState.AddModelError("Username", _localeResourceProvider.Get("Account.Error.InvalidUser"));
                }
            }

            IdentityUser user = null;
            if (model.Username.IndexOf('@') > -1)
            {
                user = await _userManager.FindByEmailAsync(model.Username);
            }
            else
            {
                user = await _userManager.FindByNameAsync(model.Username);
            }

            if (user == null)
            {
                ModelState.AddModelError(string.Empty, AccountOptions.InvalidCredentialsErrorMessage);
                var vm1 = await BuildLoginViewModelAsync(model);
                return View(vm1);
            }

            var exist = await _appUserService.AppUserCrudService.GetAsync("Where Email=@Email and IsActive=@IsActive",
                  new { Email = model.Username, IsActive = true });
            if (exist == null)
            {
                ModelState.AddModelError(string.Empty, AccountOptions.InvalidCredentialsErrorMessage);
                var vm1 = await BuildLoginViewModelAsync(model);
                return View(vm1);
            }

            //// check if username/password pair match.
            //var loggedinUser = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            //if (loggedinUser.Succeeded)
            //{
            //    await _userManager.UpdateSecurityStampAsync(user);
            //}
            string ua = ControllerContext.HttpContext.Request.Headers["User-Agent"].ToString();
            string ip = ControllerContext.HttpContext.Connection.RemoteIpAddress.ToString();
            var uaObj = new UserAgent(ua);
            string uniqueDeviceId = Request.Cookies["_wm_dvc"] == null ? Guid.NewGuid().ToString("N") : Request.Cookies["_wm_dvc"].ToString();
            GenerateDeviceId(uniqueDeviceId);
            var history = new UserLoginHistory()
            {
                Browser = $"{uaObj.Browser.Name}",
                IsFromWeb = true,
                IsFromMobile = false,
                LastLogin = DateTime.Now,
                UserDevice = $"{uaObj.Browser.Name},version={uaObj.Browser.Version}",
                UserId = user.Id,
                Device = $"{uniqueDeviceId}",
                IpAddress = ip
            };
            history.AutoFill();
            await _loginHistoryService.HistoryService.InsertAsync<long>(history);

            var userDevice = new UserDevice()
            {
                DeviceId = $"{uniqueDeviceId}",
                UserId = user.Id,
                Browser = uaObj.Browser.Name,
                BrowserVersion = uaObj.Browser.Version,
                OS = uaObj.OS.Name,
                Version = uaObj.OS.Version,
                IsActive = true,
                IsVerified = false,
                IsWeb = true,
            };
            var status = await _deviceService.CheckAndSaveDevice(userDevice);
            var passCheckResult = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            var roles = await _userManager.GetRolesAsync(user);


            if (passCheckResult.Succeeded && status.IsThisUnverifiedLogin)
            {
                string encodedText = HttpUtility.UrlEncode(QuerySecurity.EncryptEmail(model.Username));
                return Redirect($"/account/verify?idx={encodedText}&returnUrl={HttpUtility.UrlEncode(model.ReturnUrl)}");
            }
            var cookie = Request.Cookies["_wm_ivr"];
            if (!string.IsNullOrEmpty(cookie) && cookie == "true".ToMd5())
            {  //browser asking is verification required
                string encodedText = HttpUtility.UrlEncode(QuerySecurity.EncryptEmail(model.Username));
                return Redirect($"/account/verify?idx={encodedText}&returnUrl={HttpUtility.UrlEncode(model.ReturnUrl)}");
            }


            var result = await _signInManager.PasswordSignInAsync(model.Username, model.Password, true, false);

            // validate username/password against in-memory store
            if (result.Succeeded)
            {
                // only set explicit expiration here if user chooses "remember me".
                // otherwise we rely upon expiration configured in cookie middleware.
                AuthenticationProperties props = null;
                if (AccountOptions.AllowRememberLogin && model.RememberLogin)
                {
                    props = new AuthenticationProperties
                    {
                        IsPersistent = true,
                        ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration),
                    };
                }
                ;

                //var isConfirmed = await _userManager.IsEmailConfirmedAsync(user);
                //if (!isConfirmed)
                //{
                //    return RedirectToAction("Unverified");
                //}

                var userRoles = await _userManager.GetRolesAsync(user);
                if (!string.IsNullOrEmpty(model.ReturnUrl) && model.ReturnUrl.StartsWith("/connect/authorize"))
                {
                    //await _subscriptionService.CheckExpiryDates();
                    //var subs = await _salesService.UserSubscriptionCrudService.GetListAsync("Where IsExpired=@IsExpired and CustomerId=@CustomerId",
                    //    new { CustomerId = user.Id, IsExpired = false });
                    //if (subs.Any())
                    //{
                    //    var _settings = new List<SubscriptionResourceSetting>();
                    //    foreach (var sub in subs)
                    //    {
                    //        var settings =
                    //            await _subscriptionService.SubscriptionResourceSettingCrudService.GetListAsync(
                    //                "Where SubscriptionId=@SubscritionId",
                    //                new { SubscritionId = sub.SubscriptionId });
                    //        _settings.AddRange(settings.ToList());
                    //        sub.Settings = settings.ToList();

                    //    }

                    //    if (_settings.Any(x => x.Key == "AllowLoginToDiscourse" && x.AllowAccess == true))
                    //    {
                    //        return Redirect(model.ReturnUrl);

                    //    }
                    //    else
                    //    {
                    //        return Redirect("/pricing");
                    //    }
                    //}
                    //else
                    //{
                    //    return Redirect("/pricing");
                    //}
                }


                return Redirect("/");

            }


            ModelState.AddModelError(string.Empty, AccountOptions.InvalidCredentialsErrorMessage);
        }

        // something went wrong, show form with error
        var vm = await BuildLoginViewModelAsync(model);
        return View(vm);
    }

    private void GenerateDeviceId(string deviceId)
    {
        CookieOptions option = new CookieOptions
        {
            HttpOnly = false,
            Domain = _hostingEnvironment.IsDevelopment() ? "localhost" : _kachuwaConfig.CookieDomain,
            SameSite = SameSiteMode.Lax,
            IsEssential = true,
            Expires = DateTime.Now.AddDays(90)
        };
        ControllerContext.HttpContext.Response.Cookies.Append("_wm_dvc", deviceId, option);
    }

    private void GenerateTempCookie()
    {
        CookieOptions option = new CookieOptions
        {
            HttpOnly = false,
            Domain = _hostingEnvironment.IsDevelopment() ? "localhost" : _kachuwaConfig.CookieDomain,
            SameSite = SameSiteMode.Lax,
            IsEssential = true,
            Expires = DateTime.Now.AddDays(365)
        };
        ControllerContext.HttpContext.Response.Cookies.Append("_wm_ivr", "true".ToMd5(), option);
    }

    /// <summary>
    /// Show logout page
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        await HttpContext.SignOutAsync();
        await HttpContext.SignOutAsync("Cookies");

        HttpContext.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        HttpContext.Response.Headers["Expires"] = "-1";
        HttpContext.Response.Headers["Pragma"] = "no-cache";
        return SignOut(new AuthenticationProperties { RedirectUri = "/" }, "Cookies");
    }

    [Route("account/verify/sms")]
    public async Task<dynamic> SendSms(string idx)
    {
        if (string.IsNullOrEmpty(idx))
        {
            return Json(new { Code = 403, Message = _localeResourceProvider.Get("Account.Error.InvalidData") });
        }
        // var userEmail = QuerySecurity.DecryptString(idx);
        ViewBag.UserEmail = idx;

        var userEmail = QuerySecurity.DecryptEmail(idx);

        var user = await _appUserService.AppUserCrudService.GetAsync(
            "Where Email=@Email and IsDeleted=@IsDeleted",
            new { Email = userEmail, IsDeleted = false });

        if (user == null)
        {
            return Json(new { Code = 403, Message = _localeResourceProvider.Get("Account.Error.InvalidData") });
        }
        string otp = await _otpService.Generate(user.IdentityUserId);
        var otpSetting = await _otpService.GetSetting();

        var _usr = await _userManager.FindByIdAsync(user.IdentityUserId.ToString());

        if (_usr == null)
            return Json(new { Code = 403, Message = _localeResourceProvider.Get("Account.Error.InvalidUser") });

        if (otpSetting.SendFromSMS)
        {
            var isPhoneVerified = await _userManager.IsPhoneNumberConfirmedAsync(_usr);
            if (isPhoneVerified)
            {
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    if (user.PhoneNumber.StartsWith('+'))
                    {
                        var dattime = await _cacheService.GetAsync<DateTime>($"{user.PhoneNumber}verify", 60,
                            () => Task.FromResult(DateTime.Now));

                        //ViewBag.PhoneNumber = user.PhoneNumber;

                        if (dattime.AddSeconds(2) > DateTime.Now || dattime.AddSeconds(60) < DateTime.Now)
                        {
                            await _smsSender.SendSmsAsync($"{user.PhoneNumber}",
                                $"{otp} is your  verification code.");
                            return Json(new { Code = 200, Message = _localeResourceProvider.Get("Account.SMS.SMSSentSuccessfully"), Data = true });
                        }
                        else
                        {
                            return Json(new { Code = 500, Message = _localeResourceProvider.Get("Account.Error.PleaseWait60Seconds"), Data = false });
                        }
                    }
                }
            }
            return Json(new { Code = 500, Message = _localeResourceProvider.Get("Account.Error.YourPhoneNumberIsNotVerifiedYet"), Data = false });
        }

        return Json(new { Code = 500, Message = _localeResourceProvider.Get("Account.Error.SMSSettingDisabledAtTheMoment"), Data = false });
    }

    [Route("account/verify/email")]
    public async Task<dynamic> VerifyBrowserEmail(string idx)
    {
        if (string.IsNullOrEmpty(idx))
        {
            return Json(new { Code = 403, Message = "Invalid user data" });
        }
        // var userEmail = QuerySecurity.DecryptString(idx);
        ViewBag.UserEmail = idx;

        var userEmail = QuerySecurity.DecryptEmail(idx);

        var user = await _appUserService.AppUserCrudService.GetAsync(
            "Where Email=@Email and IsDeleted=@IsDeleted",
            new { Email = userEmail, IsDeleted = false });

        if (user == null)
        {
            return Json(new { Code = 403, Message = "Invalid user data" });
        }
        string otp = await _otpService.Generate(user.IdentityUserId);
        var otpSetting = await _otpService.GetSetting();

        if (otpSetting.SendFromEmail)
        {
            var webSetting = await _settingService.GetSetting();
            var objtemplate =
                await _emailTemplateService.TemplateCRUDService.GetAsync("Where TemplateName=@templateName",
                    new { templateName = "otptemplate" });
            await _emailSender.SendEmailTemplateAsync(objtemplate.EmailSubject, objtemplate.Template, new
            {
                OTPCode = otp,
                FirstName = $"{user.FirstName}",
                LastName = user.LastName,
                AccountLink = $"{_kachuwaConfig.SiteUrl}/user/dashboard",
                PricingURL = $"{_kachuwaConfig.SiteUrl}/pricing",
                DomainUrl = _kachuwaConfig.SiteUrl,
                LogoUrl = $"{_kachuwaConfig.SiteUrl}{webSetting.Logo}",
                webSetting.SupportEmail,
                InfoEmail = webSetting.DefaultEmail,
                webSetting.SalesEmail,
                EmailPreferenceUrl = $"{_kachuwaConfig.SiteUrl}/account/email",
                UnSubscribeUrl = $"{_kachuwaConfig.SiteUrl}/account/email/unsubscribe?id=" + QuerySecurity.EncryptString(user.Email),
            }, new EmailAddress[]
            {
                    new EmailAddress
                    {
                        Email = user.Email,
                        DisplayName = $"{user.FirstName} {user.LastName}"
                    }
            });
            return Json(new { Code = 200, Message = "Email successfully sent.", Data = true });
        }

        return Json(new { Code = 500, Message = "Email setting disable at the moment.", Data = false });
    }

    [Route("account/report")]
    public async Task<IActionResult> ReportAccount(string idx)
    {
        return Redirect($"/account/login?MSG={_localeResourceProvider.Get("Account.Error.YourAccountHasBeenReportedOurSupportTeamWillContactYouShortly")}");
    }

    [Route("account/verify")]
    public async Task<IActionResult> VerifyBrowser(string idx,string returnUrl="")
    {
        ViewBag.Stage = 1;
        var showSmsOption = true;
        if (string.IsNullOrEmpty(idx))
        {
            return Redirect("/account/login");
        }
        // var userEmail = QuerySecurity.DecryptString(idx);
        ViewBag.UserEmail = idx;

        var userEmail = QuerySecurity.DecryptEmail(idx);

        var user = await _appUserService.AppUserCrudService.GetAsync(
            "Where Email=@Email and IsDeleted=@IsDeleted",
            new { Email = userEmail, IsDeleted = false });

        if (!string.IsNullOrEmpty(user.PhoneNumber))
        {
            try
            {
                char[] chars = user.PhoneNumber.ToCharArray();
                for (int i = 2; i < user.PhoneNumber.Length - 4; i++)
                {
                    chars[i] = '*';
                }
                ViewBag.PhoneNumber = new string(chars);
            }
            catch (Exception e)
            {
                ViewBag.PhoneNumber = "";
            }
        }
        else
        {
            ViewBag.PhoneNumber = "";
            showSmsOption = false;
        }
        var _user = await _userManager.FindByIdAsync(user.IdentityUserId.ToString());
        //var consent = await _consentService.UserConsentService.GetAsync("Where UserId=@IdentityUserId", new { IdentityUserId = _user.Id }) ??
        //             new UserConsent() { SendSMS = false };
        var isPhoneVerified = await _userManager.IsPhoneNumberConfirmedAsync(_user);
        if (isPhoneVerified)
        {
            showSmsOption = true;
        }
        else
        {
            showSmsOption = false;
        }

        string EmailToSendOtp = userEmail;

        int atIndex = EmailToSendOtp.IndexOf('@');
        char[] emailchars = EmailToSendOtp.ToCharArray();
        for (int i = 2; i < atIndex; i++)
        {
            emailchars[i] = '*';
        }
        EmailToSendOtp = new string(emailchars);

        ViewBag.Email = EmailToSendOtp;
        if (user == null)
        {
            return Redirect("/account/login");
        }
        var otpSetting = await _otpService.GetSetting();
        ViewData["Setting"] = otpSetting;
        ViewData["ShowSMS"] = showSmsOption;
        return View(new BrowserVerificationViewModel
        {
            Email = idx,
            PhoneNumber = user.PhoneNumber,
            ReturnUrl = HttpUtility.UrlEncode(returnUrl)
        });
    }

    [Route("account/verify")]
    [HttpPost]
    public async Task<IActionResult> VerifyBrowser(BrowserVerificationViewModel model)
    {
        //if (!User.Identity.IsAuthenticated)
        //{
        //    return RedirectToAction("Login");
        //}
        try
        {
            if (ModelState.IsValid)
            {
                var userEmail = QuerySecurity.DecryptEmail(model.Email);
                _logger.Log(LogType.Info, () => $"verify user {userEmail}");
                var user = await _appUserService.AppUserCrudService.GetAsync(
                    "Where Email=@Email and IsDeleted=@IsDeleted",
                    new { Email = userEmail, IsDeleted = false });
                _logger.Log(LogType.Info, () => $"verify user found {user?.FirstName}");
                if (user == null)
                {
                    return Redirect($"/account/login?msg='{_localeResourceProvider.Get("Account.Error.InvalidUser")}'");
                }

                var status = await _otpService.Verify(model.OTP, user.IdentityUserId);
                if (status)
                {
                    string ua = ControllerContext.HttpContext.Request.Headers["User-Agent"].ToString();
                    string ip = ControllerContext.HttpContext.Connection.RemoteIpAddress.ToString();
                    var uaObj = new UserAgent(ua);
                    var userDevice = await _deviceService.DeviceService.GetAsync(
                        "Where DeviceId=@DeviceId and UserId=@UserId", new
                        {
                            DeviceId =
                                $"{Request.Cookies["_wm_dvc"]}",
                            UserId = user.IdentityUserId
                        });
                    await _deviceService.VerifyDevice(user.IdentityUserId, userDevice.UserDeviceId);
                    CookieOptions option1 = new CookieOptions
                    {
                        HttpOnly = false,
                        Domain = _hostingEnvironment.IsDevelopment() ? "localhost" : _kachuwaConfig.CookieDomain,
                        SameSite = SameSiteMode.Lax,
                        IsEssential = true,
                        Expires = DateTime.Now.AddDays(-1)
                    };
                    ControllerContext.HttpContext.Response.Cookies.Append("_wm_ivr", "", option1);
                    ControllerContext.HttpContext.Response.Cookies.Delete("_wm_ivr", option1);
                    if (User?.Identity.IsAuthenticated == true)
                    {
                        // delete local authentication cookie
                        await _signInManager.SignOutAsync();

                        // raise the logout event
                        // await _events.RaiseAsync(new UserLogoutSuccessEvent(User.GetSubjectId(), User.GetDisplayName()));
                    }

                    await HttpContext.SignOutAsync();
                    await _signInManager.SignOutAsync();
                    var _user = await _userManager.FindByEmailAsync(userEmail);
                    await _signInManager.SignInAsync(_user, true);

                    //var isConfirmed = await _userManager.IsEmailConfirmedAsync(user);
                    //if (!isConfirmed)
                    //{
                    //    return RedirectToAction("Unverified");
                    //}

                    var userRoles = await _userManager.GetRolesAsync(_user);

                    //await _subscriptionService.CheckExpiryDates();
                    //var subs = await _salesService.UserSubscriptionCrudService.GetListAsync(
                    //    "Where IsExpired=@IsExpired and CustomerId=@CustomerId",
                    //    new { CustomerId = _user.Id, IsExpired = false });
                    //if (subs.Any())
                    //{
                    //    var _settings = new List<SubscriptionResourceSetting>();
                    //    foreach (var sub in subs)
                    //    {
                    //        var settings =
                    //            await _subscriptionService.SubscriptionResourceSettingCrudService.GetListAsync(
                    //                "Where SubscriptionId=@SubscritionId",
                    //                new { SubscritionId = sub.SubscriptionId });
                    //        _settings.AddRange(settings.ToList());
                    //        sub.Settings = settings.ToList();

                    //    }

                    //}
                    //else
                    //{
                    //    return Redirect("/pricing");
                    //}


                    return Redirect(string.IsNullOrEmpty(model.ReturnUrl)?"/": model.ReturnUrl);


                }
                else
                {
                    ViewBag.Stage = 2;
                    ModelState.AddModelError("OTP", _localeResourceProvider.Get("Account.Error.InvalidOtpOrExpired"));
                    var otpSetting = await _otpService.GetSetting();
                    ViewData["Setting"] = otpSetting;
                    ViewData["ShowSMS"] = false;
                    return View(model);
                }
            }
            else
            {
                ViewBag.Stage = 2;
                var otpSetting = await _otpService.GetSetting();
                ViewData["Setting"] = otpSetting;
                ViewData["ShowSMS"] = false;
                return View(model);
            }
        }
        catch (Exception e)
        {
            return Redirect("/account/login");
        }
    }
    public async Task<IActionResult> Register()
    {
        return View();
    }

    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model, string? returnUrl = null)
    {
        ViewData["ReturnUrl"] = returnUrl;
        if (ModelState.IsValid)
        {
            _emailSender = await _emailServiceProviderService.GetDefaultEmailSender();
            if (!model.UserName.IsAlphaNumericWithUnderscore())
            {
                ModelState.AddModelError("UserName", _localeResourceProvider.Get("Account.Error.InvalidCharactersInUserName"));
                return View(model);
            }
            var newAppUser = model.To<NewUser>();
            newAppUser.UserRoles = new List<UserRolesSelected>
                {
                    new UserRolesSelected()
                    {
                        Name = YORoleNames.User,
                        IsSelected = true,
                        RoleId = YORoles.User
                    }
                };
            var status = await _appUserService.SaveNewUserAsync(newAppUser);
            if (!status.HasError)
            {
                var webSetting = await _settingService.GetSetting();

                var objtemplate = await _emailTemplateService.TemplateCRUDService.GetAsync("Where TemplateName=@templateName", new { templateName = "welcome" });
                await _emailSender.SendEmailTemplateAsync(objtemplate.EmailSubject, objtemplate.Template, new
                {
                    FirstName = $"{newAppUser.FirstName}",
                    LastName = newAppUser.LastName,
                    //AccountLink = $"{_kachuwaConfig.SiteUrl}/user/dashboard",
                    AccountLink = $"{_kachuwaConfig.SiteUrl}/user/dashboard",
                    DomainUrl = _kachuwaConfig.SiteUrl,
                    LogoUrl = $"{_kachuwaConfig.SiteUrl}{webSetting.Logo}",
                    webSetting.SupportEmail,
                    InfoEmail = webSetting.DefaultEmail,
                    webSetting.SalesEmail,
                    EmailPreferenceUrl = $"{_kachuwaConfig.SiteUrl}/account/email",
                    UnSubscribeUrl = $"{_kachuwaConfig.SiteUrl}/account/email/unsubscribe?id=" + QuerySecurity.EncryptString(newAppUser.Email),
                }, new EmailAddress[]
                {
                        new EmailAddress
                        {
                            Email = newAppUser.Email,
                            DisplayName = $"{newAppUser.FirstName} {newAppUser.LastName}"
                        }
                });
                var user = await _userManager.FindByEmailAsync(model.Email);
                //_logger.LogInformation("User created a new account with password.");
                //if (_kachuiAppConfig.RequireConfirmedEmail)
                //{
                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = Url.EmailConfirmationLink(user.UserName.ToString(), code, Request.Scheme);

                _logger.Log(LogType.Info, () => callbackUrl);
                // await _emailSender.SendEmailConfirmationAsync(model.Email, callbackUrl);

                objtemplate = await _emailTemplateService.TemplateCRUDService.GetAsync("Where TemplateName=@templateName", new { templateName = "emailconfirmation" });

                await _emailSender.SendEmailTemplateAsync(objtemplate.EmailSubject,
                   objtemplate.Template, new
                   {
                       VerificationUrl = callbackUrl,
                       FullName = $"{newAppUser.FirstName} {newAppUser.LastName}",
                       DomainUrl = _kachuwaConfig.SiteUrl,
                       LogoUrl = $"{_kachuwaConfig.SiteUrl}{webSetting.Logo}",
                       webSetting.SupportEmail,
                       InfoEmail = webSetting.DefaultEmail,
                       webSetting.SalesEmail,
                       EmailPreferenceUrl = $"{_kachuwaConfig.SiteUrl}/account/email",
                       UnSubscribeUrl = $"{_kachuwaConfig.SiteUrl}/account/email/unsubscribe?id=" + QuerySecurity.EncryptString(newAppUser.Email),
                   }, new EmailAddress[]
                    {
                            new EmailAddress
                            {
                                Email = newAppUser.Email,
                                DisplayName = $"{newAppUser.FirstName} {newAppUser.LastName}"
                            }
                    });

                return View("RegisterConfirm");
            }
            else
            {
                ModelState.AddModelError(string.Empty, status.Message);
            }
        }

        // If we got this far, something failed, redisplay form
        return View(model);
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ConfirmEmail(string userName, string code)
    {
        if (userName == null || code == null)
        {
            return Redirect("/");
        }
        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            throw new Exception($"Unknown User.");
        }

        var status = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.EmailConfirmationTokenProvider, "ConfirmEmail", code);
        if (status)
        {
            string token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var result = await _userManager.ConfirmEmailAsync(user, token);
            return View(result.Succeeded ? "ConfirmEmail" : "Error");
        }
        // _logger.Log(LogType.Info, () => $"{JsonConvert.SerializeObject(user)},=code{ code}");

        return View("Error");
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult ForgotPassword()
    {
        return View();
    }

    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordViewModel model)
    {
        if (ModelState.IsValid)
        {
            var user = await _userManager.FindByEmailAsync(model.EmailOrUserName);
            if (user == null //|| !(await _userManager.IsEmailConfirmedAsync(user))
                )
            {
                // Don't reveal that the user does not exist or is not confirmed
                return RedirectToAction(nameof(ForgotPasswordConfirmation));
            }

            try
            {


                var appuser =
                    await _appUserService.AppUserCrudService.GetAsync("Where IdentityUserId=@Id and IsDeleted=@IsDeleted", new { Id = user.Id, IsDeleted = false });
                // For more information on how to enable account confirmation and password reset please
                // visit https://go.microsoft.com/fwlink/?LinkID=532713
                var code = await _userManager.GeneratePasswordResetTokenAsync(user);
                var callbackUrl = Url.ResetPasswordCallbackLink(HttpUtility.UrlEncode(user.Email.ToString()), HttpUtility.UrlEncode(code), Request.Scheme);
                var webSetting = await _settingService.GetSetting();

                var isUnsubscribed = await _unSubscriptionService.CheckUserHasUnsubscribed(appuser.Email, "Transactional");
                if (!isUnsubscribed)
                {
                    var objtemplate = await _emailTemplateService.TemplateCRUDService.GetAsync("Where TemplateName=@templateName", new { templateName = "resetpassword" });
                    await _emailSender.SendEmailTemplateAsync(objtemplate.EmailSubject, objtemplate.Template,
                        new
                        {
                            FullName = $"{appuser.FirstName} {appuser.LastName}",
                            ResetPasswordLink = callbackUrl,
                            DomainUrl = _kachuwaConfig.SiteUrl,
                            LogoUrl = $"{_kachuwaConfig.SiteUrl}{webSetting.Logo}",
                            webSetting.SupportEmail,
                            InfoEmail = webSetting.DefaultEmail,
                            webSetting.SalesEmail,
                            EmailPreferenceUrl = $"{_kachuwaConfig.SiteUrl}/account/email",
                            UnSubscribeUrl = $"{_kachuwaConfig.SiteUrl}/account/email/unsubscribe?id=" + QuerySecurity.EncryptString(appuser.Email),
                        }, new EmailAddress[]
                        {
                            new EmailAddress
                            {
                                Email = appuser.Email,
                                DisplayName = $"{appuser.FirstName} {appuser.LastName}"
                            }
                        });
                }
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
            }

            return RedirectToAction(nameof(ForgotPasswordConfirmation));
        }

        // If we got this far, something failed, redisplay form
        return View(model);
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult ForgotPasswordConfirmation()
    {
        return View();
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(string? code = null, string? userName = "")
    {
        if (code == null)
        {
            throw new ApplicationException(_localeResourceProvider.Get("Account.Error.ACodeMustBeSuppliedForPasswordReset"));
        }
        var model = new ResetPasswordViewModel { Code = HttpUtility.UrlDecode(code), EmailOrUserName = HttpUtility.UrlDecode(userName) };
        var user = await _userManager.FindByEmailAsync(HttpUtility.UrlDecode(userName));
        if (user == null)
        {
            model.HasError = true;
            model.Message = _localeResourceProvider.Get("Account.Error.TokenIsInvalidOrExpired");
            return View(model);
        }
        var status = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", HttpUtility.UrlDecode(code));
        if (status)
        {
            return View(model);
        }
        else
        {
            model.HasError = true;
            model.Message = _localeResourceProvider.Get("Account.Error.TokenIsInvalidOrExpired");
            return View(model);
        }
    }

    [HttpPost]
    [AllowAnonymous]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ResetPassword(ResetPasswordViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }
        var user = await _userManager.FindByEmailAsync(model.EmailOrUserName);
        if (user == null)
        {
            // Don't reveal that the user does not exist
            return RedirectToAction(nameof(ResetPasswordConfirmation));
        }
        var status = await _userManager.VerifyUserTokenAsync(user, _userManager.Options.Tokens.PasswordResetTokenProvider, "ResetPassword", model.Code);
        if (status)
        {
            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, code, model.Password);
            if (result.Succeeded)
            {
                return RedirectToAction(nameof(ResetPasswordConfirmation));
            }
            foreach (var error in result.Errors)
            {
                ModelState.AddModelError(string.Empty, error.Description);
            }
        }

        return View();
    }

    [HttpGet]
    [AllowAnonymous]
    public IActionResult ResetPasswordConfirmation()
    {
        return View();
    }

    [HttpGet]
    public IActionResult AccessDenied()
    {
        return View();
    }





    private async Task<LoginViewModel> BuildLoginViewModelAsync(string returnUrl)
    {


        return new LoginViewModel
        {
            AllowRememberLogin = AccountOptions.AllowRememberLogin,
            ReturnUrl = returnUrl,
        };
    }

    private async Task<LoginViewModel> BuildLoginViewModelAsync(LoginInputModel model)
    {
        var vm = await BuildLoginViewModelAsync(model.ReturnUrl);
        vm.Username = model.Username;
        vm.RememberLogin = model.RememberLogin;
        return vm;
    }

}