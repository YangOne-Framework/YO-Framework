using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using YangOne.Admin.Dto;
using YangOne.Configuration;
using YangOne.Data.Extension;
using YangOne.Extensions;
using YangOne.Identity;
using YangOne.Identity.Dto;
using YangOne.Identity.Extensions;
using YangOne.Identity.Model;
using YangOne.Identity.Service;
using YangOne.Log;
using YangOne.OTP.Service;
using YangOne.Storage;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Security.API;
using YangOne.Web.Service;
using YangOne.Web.Services;
using IdentityUser = YangOne.Identity.Model.IdentityUser;

namespace YandOne.Admin.API;

[Route("api/v1/user")]
public  class UserApiController : BaseApiController
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IEmailSender _emailSender;
    private readonly IAppUserService _userService;
    private readonly ILogger _logger;
    private readonly IConfiguration _configuration;
    private readonly IStorageProvider _storageProvider;
    private readonly IWebHostEnvironment _hostingEnvironment;
    private readonly IExportService _exportService;
    private readonly ILoginHistoryService _loginHistoryService;
    private readonly IUserDeviceService _deviceService;
    private readonly IOTPService _otpService;
   // private readonly ISmsSender _smsSender;
    private readonly YangOneAppConfig _yoAppConfig;
    private readonly IMemoryCache _cache;
    private readonly IIdentityRoleService _identityRoleService;


    public UserApiController(UserManager<IdentityUser> userManager,
        IEmailSender emailSender,
        IAppUserService userService, ILogger logger, IConfiguration configuration, IOptionsSnapshot<YangOneAppConfig> 
            yoConfigSnap,
        IStorageProvider storageProvider, IWebHostEnvironment hostingEnvironment
        , IExportService exportService, ILoginHistoryService loginHistoryService, IUserDeviceService deviceService,
        IOTPService otpService,
       
        IMemoryCache cache, IIdentityRoleService identityRoleService)
    {
        _userManager = userManager;
        _emailSender = emailSender;
        _userService = userService;
        _logger = logger;
        _configuration = configuration;
        _storageProvider = storageProvider;
        _hostingEnvironment = hostingEnvironment;
        _exportService = exportService;
        _loginHistoryService = loginHistoryService;
        _deviceService = deviceService;
        _otpService = otpService;
       // _smsSender = smsSender;
        _yoAppConfig = yoConfigSnap.Value;
        _cache = cache;
        _identityRoleService = identityRoleService;
    }

    #region Managment 
    [Route("management/all")]
    [HttpGet]
    public async Task<dynamic> GetAllUsers(int offset = 1, int limit = 10, string search = "", string email = "", string phone = "",  string roleId = "")
    {
        var user = await _userService.GetAllUsers(offset, limit, search, email, phone, roleId);
        return HttpResponse(200, "success", user);


    }
    [Route("management/changepassword")]
    [HttpPost]
   
    public async Task<dynamic> ChangePasswordByAdmin(ChangePasswordByAdminRequest model)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(model.IdentityUserId.ToString());
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (result.Succeeded)
                return HttpResponse(200, "Password changed successfully.", true);
            else
                return HttpResponse(500, "Unable to change password.", false);


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }

    [Route("management/save")]
    [HttpPost]
    
    public async Task<dynamic> SaveManagementUser([FromBody] AppUserRegisterModel model)
    {
        try
        {
            if (model.AppUserId == 0)
            {
                if (string.IsNullOrEmpty(model.Password) || model.Password.Length < 8)
                    return ErrorResponse(400, "Password must be at least 8 characters.");

                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                    return ErrorResponse(400, "Email already registered.");

                NewUser newAppUser = model.To<NewUser>();
                newAppUser.UserRoles = new List<UserRolesSelected>();
                if (model.RoleIds != null)
                {
                    foreach (var roleId in model.RoleIds)
                    {
                        newAppUser.UserRoles.Add(new UserRolesSelected
                        {
                            RoleId = roleId,
                            IsSelected = true
                        });
                    }
                }
                if (newAppUser.UserRoles.Count == 0)
                {
                    newAppUser.UserRoles.Add(new UserRolesSelected
                    {
                        Name = YORoleNames.User,
                        IsSelected = true,
                        RoleId = YORoles.User
                    });
                }

                var userStatus = await _userService.SaveNewUserAsync(newAppUser);
                if (!userStatus.HasError)
                    return HttpResponse(200, "User created successfully.", true);
                else
                    return ErrorResponse(500, "Failed to create user.");
            }
            else
            {
                var appUser = await _userService.AppUserCrudService.GetAsync(model.AppUserId);
                if (appUser == null)
                    return ErrorResponse(404, "User not found.");

                appUser.FirstName = model.FirstName;
                appUser.LastName = string.IsNullOrEmpty(model.LastName) ? " " : model.LastName;
                appUser.PhoneNumber = model.PhoneNumber;
                appUser.Address = model.Address;
                appUser.Gender = model.Gender;
                appUser.DOB = model.DOB;
                appUser.IsActive = model.IsActive;
                appUser.AutoFill();
                await _userService.AppUserCrudService.UpdateAsync(appUser);

                var identityUser = await _userManager.FindByIdAsync(appUser.IdentityUserId.ToString());
                if (identityUser != null && model.RoleIds != null)
                {
                    var currentRoles = await _userManager.GetRolesAsync(identityUser);
                    await _userManager.RemoveFromRolesAsync(identityUser, currentRoles);

                    var roleNames = new List<string>();
                    foreach (var roleId in model.RoleIds)
                    {
                        var role = await _identityRoleService.RoleService.GetAsync(roleId);
                        if (role != null)
                            roleNames.Add(role.Name);
                    }
                    if (roleNames.Count > 0)
                        await _userManager.AddToRolesAsync(identityUser, roleNames);
                }

                return HttpResponse(200, "User updated successfully.", true);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    [Route("management/{id:int}")]
    [HttpGet]
    
    public async Task<dynamic> GetManagementUserById(int id)
    {
        try
        {
            var appUser = await _userService.AppUserCrudService.GetAsync(id);
            if (appUser == null)
                return ErrorResponse(404, "User not found.");

            var identityUser = await _userManager.FindByIdAsync(appUser.IdentityUserId.ToString());
            var roles = new List<object>();
            if (identityUser != null)
            {
                var roleNames = await _userManager.GetRolesAsync(identityUser);
                var allRoles = await _identityRoleService.RoleService.GetListAsync();
                foreach (var roleName in roleNames)
                {
                    var matchedRole = allRoles.FirstOrDefault(r => r.Name == roleName);
                    if (matchedRole != null)
                        roles.Add(new { Id = matchedRole.Id, Name = matchedRole.Name });
                }
            }
            

            return HttpResponse(200, "success", new
            {
                appUser.AppUserId,
                appUser.FirstName,
                appUser.LastName,
                appUser.Email,
                appUser.UserName,
                appUser.PhoneNumber,
                appUser.Address,
                appUser.Gender,
                appUser.DOB,
                appUser.IsActive,
                appUser.ProfilePicture,
                Roles = roles
            });
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    [Route("management/delete")]
    [HttpPost]
    
    public async Task<dynamic> DeleteManagementUser([FromBody] dynamic model)
    {
        try
        {
            long userId = (long)model.AppUserId;
            var appUser = await _userService.AppUserCrudService.GetAsync(userId);
            if (appUser == null)
                return ErrorResponse(404, "User not found.");

            appUser.IsDeleted = true;
            appUser.IsActive = false;
            appUser.AutoFill();
            await _userService.AppUserCrudService.UpdateAsync(appUser);

            var identityUser = await _userManager.FindByIdAsync(appUser.IdentityUserId.ToString());
            if (identityUser != null)
            {
                identityUser.LockoutEnd = DateTimeOffset.MaxValue;
                await _userManager.UpdateAsync(identityUser);
            }

            return HttpResponse(200, "User deleted successfully.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    [Route("management/resetpassword")]
    [HttpPost]
    
    public async Task<dynamic> ResetManagementPassword([FromBody] ChangePasswordByAdminRequest model)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(model.IdentityUserId.ToString());
            if (user == null)
                return ErrorResponse(404, "User not found.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (result.Succeeded)
                return HttpResponse(200, "Password reset successfully.", true);
            else
                return ErrorResponse(500, "Failed to reset password.");
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    [Route("management/login-history/{userId:long}")]
    [HttpGet]
    
    public async Task<dynamic> GetLoginHistory(long userId)
    {
        try
        {
            var history = await _loginHistoryService.HistoryService.GetListAsync(
                "Where UserId=@UserId order by AddedOn desc",
                new { UserId = userId });
            return HttpResponse(200, "success", history);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    #endregion


    [Route("profile")]
    /// <summary>
    /// Fetches the profile of the currently logged-in user.
    /// </summary>
    /// <param name="userId">The ID of the user (not currently used, fetched from token).</param>
    /// <returns>
    /// 200 OK with user profile data if authorized,
    /// 401 Unauthorized if user is not logged in.
    /// </returns>
    [HttpGet]

    public async Task<dynamic> Profile()
    {
        if (User.Identity.GetIdentityUserId() > 0)
        {

            var user = await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@IdentityUserId", new { IdentityUserId = User.Identity.GetIdentityUserId() });

            return HttpResponse(200, "success", user);
        }
        else
        {
            return ErrorResponse(401, "Unauthorized Access");
        }

    }

    [Route("check/active")]
    /// <summary>
    /// Checks whether the current user is active.
    /// </summary>
    /// <returns>
    /// 200 OK with boolean true/false indicating active status,
    /// 401 Unauthorized if user is not logged in.
    /// </returns>
    [HttpGet]

    public async Task<dynamic> CheckIsActive()
    {
        if (User.Identity.GetIdentityUserId() > 0)
        {

            var user = await _userService.AppUserCrudService.GetAsync(User.Identity.GetIdentityUserId());

            return HttpResponse(200, "success", user.IsActive);
        }
        else
        {
            return ErrorResponse(401, "Unauthorized Access");
        }

    }
    [Route("device/otp/generate")]
    /// <summary>
    /// Generates an OTP for device verification or email/phone update.
    /// </summary>
    /// <param name="newEmail">Optional new email to send OTP for verification.</param>
    /// <param name="newPhoneNumber">Optional new phone number to send OTP.</param>
    /// <param name="userName">The username or email of the user requesting OTP.</param>
    /// <returns>
    /// 200 OK with user data if OTP generation succeeds,
    /// 401 Unauthorized if userName is invalid,
    /// 500 Internal Server Error if an exception occurs.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> Generate(string newEmail, string newPhoneNumber, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse(401, "Unauthorized Access");
            }

            var user = userName.Contains("@") ? await _userManager.FindByEmailAsync(userName) : await _userManager.FindByNameAsync(userName);
            var appuser = await _userService.AppUserCrudService.GetAsync(
                "Where IdentityUserId=@userId",
                new { userId = user.Id });
            string otp = await _otpService.Generate(user.Id);
            var isPhoneVerified = await _userManager.IsPhoneNumberConfirmedAsync(user);
            var dN = appuser.FirstName + " " + appuser.LastName;
            _logger.Log(LogType.Info, () => $"{otp} otp code for user {appuser.FirstName}");
            //case for trust this device only
            //if (!string.IsNullOrEmpty(userName))
            //{


            //    await _emailSender.SendTemplatedEmailAsync<dynamic>("Your verification Code",
            //        "emailtemplates/ok_otp_send.html",
            //        new { OTPCode = otp },
            //        new EmailAddress[] { new EmailAddress { DisplayName = dN, Email = appuser.Email } });
            //    if (!string.IsNullOrEmpty(appuser.PhoneNumber))
            //    {
            //        //TODO:: check valid nepali no
            //        await _smsSender.SendSmsAsync(appuser.PhoneNumber.PhoneNumberWithoutCountry(),
            //            $"{otp} is your Online Kachhya Verification Code.");
            //    }

            //}

            //if (user.Email.Contains("LMS.com"))
            //{
            //    return HttpResponse(490, "please update/change email address.");
            //}

            //sending new email verification
            if (!string.IsNullOrEmpty(newEmail))
            {
                var xuser = await _userManager.FindByEmailAsync(newEmail);
                if (xuser != null)
                {
                    return HttpResponse(500, "email already exists.", false);
                }
                await _emailSender.SendTemplatedEmailAsync<dynamic>("Your verification Code",
                    "emailtemplates/ok_otp_send.html",
                    new { OTPCode = otp },
                    new EmailAddress[] { new EmailAddress { DisplayName = dN, Email = newEmail } });
            }
            else
            { //case for trust this device only
                //sending old email
                //checking is request for new number ?
                if (string.IsNullOrEmpty(newPhoneNumber))
                {
                    await _emailSender.SendTemplatedEmailAsync<dynamic>("Your verification Code",
                        "emailtemplates/ok_otp_send.html",
                        new { OTPCode = otp },
                        new EmailAddress[] { new EmailAddress { DisplayName = dN, Email = user.Email } });
                }
            }

            if (!string.IsNullOrEmpty(newPhoneNumber))
            {
                //TODO:: check valid nepali no
               // await _smsSender.SendSmsAsync(user.PhoneNumber.PhoneNumberWithoutCountry(),
               //     $"{otp} is your Online Kachhya Verification Code.");
            }
            else
            {

                if (isPhoneVerified)
                {
                    if (!string.IsNullOrEmpty(appuser.PhoneNumber))
                    {
                        //case for trust this device only
                        //TODO:: check valid nepali no
                        //await _smsSender.SendSmsAsync(appuser.PhoneNumber.PhoneNumberWithoutCountry(),
                        //    $"{otp} is your Online Kachhya Verification Code.");
                    }
                }
            }

            return HttpResponse(200, "success", user);



        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }

    [Route("device/verify")]
    /// <summary>
    /// Verifies a device using OTP.
    /// </summary>
    /// <param name="device">The unique device identifier.</param>
    /// <param name="otp">The OTP code received by user.</param>
    /// <param name="userName">The username or email of the user.</param>
    /// <returns>
    /// 200 OK if verification succeeds,
    /// 403 Forbidden if verification fails,
    /// 500 Internal Server Error if exception occurs.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> DeviceVerify(string device, string otp, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse(401, "Unauthorized Access");
            }
            var user = userName.Contains("@") == true ? await _userManager.FindByEmailAsync(userName) : await _userManager.FindByNameAsync(userName);

            var status = await _otpService.Verify(otp, user.Id);
            if (status)
            {
                var userdevice = await _deviceService.DeviceService.GetAsync("Where IsDeleted=@IsDeleted and DeviceId=@DeviceId and UserId=@UserId", new { IsDeleted = false, DeviceId = device, UserId = user.Id });
                userdevice.IsVerified = true;

                await _deviceService.DeviceService.UpdateAsync(userdevice);
                return HttpResponse(200, "success");
            }
            return HttpResponse(403, "Verifaction failed!");

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }




    [Route("change/email")]
    /// <summary>
    /// Changes the user's email after OTP verification.
    /// </summary>
    /// <param name="newEmail">The new email to assign.</param>
    /// <param name="otp">The OTP received by user.</param>
    /// <param name="userName">The username or email of the user.</param>
    /// <returns>
    /// 200 OK if email change succeeds,
    /// 403 if verification fails or email already exists,
    /// 500 Internal Server Error if exception occurs.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> ChangeEmail(string newEmail, string otp, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse(401, "Unauthorized Access");
            }
            var user = userName.Contains("@") == true ? await _userManager.FindByEmailAsync(userName) : await _userManager.FindByNameAsync(userName);

            var status = await _otpService.Verify(otp, user.Id);
            if (status)
            {
                var existingUser = await _userManager.FindByEmailAsync(newEmail);
                if (existingUser != null)
                {
                    return HttpResponse(403, "email already in use.");
                }
                else
                {
                    await _userService.ChangeEmailAsync(user.Id, newEmail);
                    var ux = await _userManager.FindByIdAsync(user.Id.ToString());
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(ux);
                    await _userManager.ConfirmEmailAsync(ux, token);
                    return HttpResponse(200, "success");
                }
            }

            return HttpResponse(403, "Verifaction failed!");


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }

    [Route("change/phone")]
    /// <summary>
    /// Changes the user's phone number after OTP verification.
    /// </summary>
    /// <param name="phoneNumber">The new phone number to assign.</param>
    /// <param name="otp">The OTP received by user.</param>
    /// <returns>
    /// 200 OK if phone change succeeds,
    /// 403 if verification fails,
    /// 401 Unauthorized if user is not logged in,
    /// 500 Internal Server Error if exception occurs.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> ChangePhone(string phoneNumber, string otp)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId > 0)
            {
                var status = await _otpService.Verify(otp, userId);
                if (status)
                {
                    await _userService.ChangePhoneNumberAsync(userId, phoneNumber);
                    var user = await _userManager.FindByIdAsync(userId.ToString());
                    var token = await _userManager.GenerateChangePhoneNumberTokenAsync(user, phoneNumber);
                    await _userManager.VerifyChangePhoneNumberTokenAsync(user, token, phoneNumber);

                    return HttpResponse(200, "success");
                }

                return HttpResponse(403, "Verifaction failed!");
            }
            else
            {
                return ErrorResponse(401, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }
    [Route("phone/verification/status")]
    /// <summary>
    /// Returns phone verification status of the logged-in user.
    /// </summary>
    /// <returns>
    /// 200 OK with boolean indicating verification status,
    /// 401 Unauthorized if user is not logged in.
    /// </returns>
    public async Task<dynamic> GetPhoneVerificationStatus()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId > 0)
            {

                var user = await _userManager.FindByIdAsync(userId.ToString());
                var status = await _userManager.IsPhoneNumberConfirmedAsync(user);
                return HttpResponse(200, "success", status);

            }
            else
            {
                return ErrorResponse(401, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }
   

    //[Route("login")]
    ///// <summary>
    ///// Authenticates a user and generates access and refresh tokens.
    ///// </summary>
    ///// <param name="userName">User's email or username.</param>
    ///// <param name="password">User's password.</param>
    ///// <param name="device">Device identifier.</param>
    ///// <param name="os">Device operating system.</param>
    ///// <param name="version">Device OS version.</param>
    ///// <returns>
    ///// 200 OK with user info and tokens on successful login,
    ///// 487 if email is not confirmed,
    ///// 490 if email needs to be updated,
    ///// 500 if login fails due to error.
    ///// </returns>

    //[HttpPost]
    //public async Task<dynamic> Login(string userName, string password, string device, string os, string version)
    //{
    //    string ip = ControllerContext.HttpContext.Connection.RemoteIpAddress?.ToString();


    //    var cacheKey = $"Login_Retry_{ip}";
    //    if (_cache.TryGetValue(cacheKey, out int retryCount))
    //    {
    //        if (retryCount >= 5)
    //        {

    //            return ErrorResponse(429, "Too many login attempts. Please try again in 1 minute.");
    //        }
    //    }
    //    try
    //    {
    //        var identityUser = await _userManager.FindByNameAsync(userName)
    //                           ?? await _userManager.FindByEmailAsync(userName);
    //        if (identityUser != null)
    //        {
    //            if (await _userManager.IsLockedOutAsync(identityUser))
    //            {
    //                return ErrorResponse(423, "Account is locked due to multiple failed login attempts. Please try again later.");
    //            }
    //        }

    //        var tokenResponse = await RequestToken(userName, password);
    //        string token = "", rfTorken = "";
    //        if (tokenResponse.IsError)
    //        {
    //            var cacheEntryOptions = new MemoryCacheEntryOptions()
    //                .SetAbsoluteExpiration(TimeSpan.FromMinutes(1));
    //            _cache.Set(cacheKey, retryCount + 1, cacheEntryOptions);


    //            if (identityUser != null)
    //            {
    //                await _userManager.AccessFailedAsync(identityUser);

    //                if (await _userManager.IsLockedOutAsync(identityUser))
    //                {
    //                    return ErrorResponse(423, "Account has been locked.");
    //                }
    //            }

    //            return ErrorResponse(400, "Invalid username or password.");
    //        }

    //        else
    //        {
    //            token = tokenResponse.AccessToken;
    //            rfTorken = tokenResponse.RefreshToken;

    //        }

    //        string ua = ControllerContext.HttpContext.Request.Headers["User-Agent"].ToString();
    //        var uaObj = new UserAgent(ua);
    //        if (userName.IndexOf('@') > -1)
    //        {


    //            var appuser = await _userService.AppUserCrudService.GetAsync("Where Email=@Email and IsActive=1",
    //                new { Email = userName });


    //            var user = await _userManager.FindByIdAsync(appuser.IdentityUserId.ToString());
    //            var isConfirmed = await _userManager.IsEmailConfirmedAsync(user);
    //            if (!isConfirmed)
    //            {
    //                return HttpResponse(487, "please confirm your email address.");
    //            }
    //            //if (user == null)
    //            appuser.Token = token;
    //            appuser.RefreshToken = rfTorken;
    //            var history = new UserLoginHistory()
    //            {
    //                Browser = $"",
    //                IsFromWeb = false,
    //                IsFromMobile = true,
    //                LastLogin = DateTime.Now,
    //                UserDevice = $"{device}",
    //                UserId = appuser.IdentityUserId,
    //                Device = $"{device}",
    //                IpAddress = ip

    //            };
    //            history.AutoFill();
    //            await _loginHistoryService.HistoryService.InsertAsync<long>(history);

    //            var userDevice = new UserDevice()
    //            {
    //                DeviceId = $"{device}",
    //                UserId = appuser.IdentityUserId,
    //                Browser = "",
    //                BrowserVersion = "",
    //                OS = os,
    //                Version = version,
    //                IsActive = true,
    //                IsVerified = false,
    //                IsWeb = false,
    //                IsMobile = true

    //            };
    //            //var status = await _deviceService.CheckAndSaveDevice(userDevice);
    //            //// int userLoggedInDeviceCount = await _loginHistoryService.GetUserLoggedInDevicesNumber(user.Id);
    //            //if (status.IsThisUnverifiedLogin)
    //            //{
    //            //    if (status.MobileDevice)
    //            //    {   //already loggedint from device.
    //            //        return HttpResponse(488, "Unauthorized  Device", new { });
    //            //    }
    //            //    else
    //            //    {
    //            //        return HttpResponse(489, "Verify Your Device", new { });
    //            //    }
    //            //}
    //            return HttpResponse(200, "success", new { User = appuser });
    //        }
    //        else
    //        {
    //            var appuser = await _userService.AppUserCrudService.GetAsync(
    //                "Where IsActive=@isActive and UserName=@UserName",
    //                new { UserName = userName, isActive = true });

    //            //TEST USER FOR IOS APP STORE
    //            if (userName.ToLower() == "iostestuser")
    //            {
    //                appuser.Token = token;
    //                appuser.RefreshToken = rfTorken;
    //                var history = new UserLoginHistory()
    //                {
    //                    Browser = $"",
    //                    IsFromWeb = false,
    //                    IsFromMobile = true,
    //                    LastLogin = DateTime.Now,
    //                    UserDevice = $"{device}",
    //                    UserId = appuser.IdentityUserId,
    //                    Device = $"{device}",
    //                    IpAddress = ip

    //                };
    //                history.AutoFill();
    //                await _loginHistoryService.HistoryService.InsertAsync<long>(history);

    //                return HttpResponse(200, "success", new { User = appuser });
    //            }
    //            else
    //            {
    //                if (appuser.Email.ToLower().Contains("LMS.com") ||
    //                    appuser.Email.ToLower().Contains("kachuwaframework.com"))
    //                {
    //                    return HttpResponse(490, "please update/change email address.");
    //                }

    //                var user = await _userManager.FindByIdAsync(appuser.IdentityUserId.ToString());
    //                var isConfirmed = await _userManager.IsEmailConfirmedAsync(user);
    //                if (!isConfirmed)
    //                {
    //                    return HttpResponse(487, "please confirm your email address.");
    //                }

    //                appuser.Token = token;
    //                appuser.RefreshToken = rfTorken;
    //                var history = new UserLoginHistory()
    //                {
    //                    Browser = $"",
    //                    IsFromWeb = false,
    //                    IsFromMobile = true,
    //                    LastLogin = DateTime.Now,
    //                    UserDevice = $"{device}",
    //                    UserId = appuser.IdentityUserId,
    //                    Device = $"{device}",
    //                    IpAddress = ip

    //                };
    //                history.AutoFill();
    //                await _loginHistoryService.HistoryService.InsertAsync<long>(history);

    //                var userDevice = new UserDevice()
    //                {
    //                    DeviceId = $"{device}",
    //                    UserId = appuser.IdentityUserId,
    //                    Browser = "",
    //                    BrowserVersion = "",
    //                    OS = os,
    //                    Version = version,
    //                    IsActive = true,
    //                    IsVerified = false,
    //                    IsWeb = false,
    //                    IsMobile = true

    //                };
    //                //var status = await _deviceService.CheckAndSaveDevice(userDevice);
    //                //// int userLoggedInDeviceCount = await _loginHistoryService.GetUserLoggedInDevicesNumber(user.Id);
    //                //if (status.IsThisUnverifiedLogin)
    //                //{
    //                //    if (status.MobileDevice)
    //                //    {
    //                //        //already loggedint from device.
    //                //        return HttpResponse(488, "Unauthorized  Device", new { });
    //                //    }
    //                //    else
    //                //    {
    //                //        return HttpResponse(489, "Verify Your Device", new { });
    //                //    }
    //                //}

    //                return HttpResponse(200, "success", new { User = appuser });
    //            }
    //        }
    //        //{
    //        //    return HttpResponse(400, "invalid user");
    //        //}




    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(500, e.Message);
    //    }

    //}

    /// <summary>
    /// register new user from mobile devices
    /// </summary>
    /// <param name="model"></param>
    /// <returns>return profile with token </returns>
    [Route("new")]
    /// <summary>
    /// Registers a new user from mobile devices.
    /// </summary>
    /// <param name="model">User registration model.</param>
    /// <returns>
    /// 487 if registration succeeds and email verification is sent,
    /// 500 if registration fails due to server error,
    /// ValidationResponse if input validation fails.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> Register(AppUserRegisterModel model)
    {
        try
        {
            if (string.IsNullOrEmpty(model.Password) || model.Password.Length < 8)
            {
                ModelState.AddModelError(model.Password, "Password must be of at least 8 character.");
            }

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                ModelState.AddModelError(model.Email, "Email already registered.");
            }
            if (!model.UserName.IsAlphaNumericWithUnderscore())
            {
                ModelState.AddModelError("UserName", "invalid characters in UserName");

            }
            if (ModelState.IsValid)
            {
                NewUser newAppUser = model.To<NewUser>();

                newAppUser.UserRoles = new List<UserRolesSelected>
                {
                    new UserRolesSelected()
                    {
                        Name = YORoleNames.User,
                        IsSelected = true,
                        RoleId = YORoles.User
                    }
                };
                var userStatus = await _userService.SaveNewUserAsync(newAppUser);

                if (!userStatus.HasError)
                {
                    var user = await _userManager.FindByEmailAsync(model.Email);


                    //if (_kachuwaAppConfig.RequireConfirmedEmail)
                    //{
                    //    var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    //    var callbackUrl = (_hostingEnvironment.IsDevelopment() ? "http://localhost:8887/account/confirm" : $"http://auth.LMS.com/account/confirm") + $"?userId={user.Id}&code={code}";
                    //    await _emailSender.SendEmailConfirmationAsync(model.Email, callbackUrl);
                    //    _logger.Log(LogType.Info, () =>
                    //        $"{ model.Email} Please confirm your account by clicking this link: <a href='{HtmlEncoder.Default.Encode(callbackUrl)}'>link</a>");

                    //    return HttpResponse(700, "Please verify your account.");
                    //}
                    ////_logger.Log("User created a new account with password.");

                    //var tokenResponse = await RequestToken(model.Email, model.Password);
                    //if (tokenResponse.IsError)
                    //{
                    //    return ErrorResponse(500, tokenResponse.ErrorDescription);
                    //}
                    //else
                    //{
                    //    appUser.Token = tokenResponse.AccessToken;
                    //    appUser.RefreshToken = tokenResponse.RefreshToken;
                    //}
                    var appuser =
                        await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@Id", new { Id = user.Id });
                    // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    string otp = await _otpService.Generate(user.Id);
                    var callbackUrl =
                        $"https://auth.LMS.com/account/ConfirmEmail?code={otp}&userName={appuser.UserName}"; //Url.ResetPasswordCallbackLink(user.UserName.ToString(), code, Request.Scheme);
                    // Url.EmailConfirmationLink(user.UserName.ToString(), code, Request.Scheme);

                    _logger.Log(LogType.Info, () => callbackUrl);
                    // await _emailSender.SendEmailConfirmationAsync(model.Email, callbackUrl);

                    await _emailSender.SendTemplatedEmailAsync("Verify Your Email",
                        "emailtemplates/ok_email_verify.html", new
                        {
                            VerificationLink = callbackUrl,
                            Name = $"{appuser.FirstName} {appuser.LastName}"
                        }, new EmailAddress[]
                        {
                            new EmailAddress
                            {
                                Email = appuser.Email,
                                DisplayName = $"{appuser.FirstName} {appuser.LastName}"

                            }
                        });
                    return HttpResponse(487, "Thank you for registration. Please verify your email", true);
                }
                else
                {
                    return ErrorResponse(500, "Failed to add new user at the moment,Try again later. ");
                }
            }
            else
            {
                return ValidationResponse(ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }


    [Route("picture/upload")]
    /// <summary>
    /// Uploads or updates the profile picture for the logged-in user.
    /// </summary>
    /// <param name="file">Profile picture file.</param>
    /// <returns>
    /// 200 OK if file uploaded successfully,
    /// 401 Unauthorized if user is not logged in,
    /// ValidationResponse if file is null,
    /// 500 Internal Server Error if exception occurs.
    /// </returns>
    [HttpPost]
    public async Task<dynamic> UploadProfilePicture(IFormFile file)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() > 0)
            {

                if (file != null)
                {
                    string filepath = await _storageProvider.Save("UserProfile", file);
                    // return HttpResponse(ApiResponseCode.Success, "File uploaded saved successfully.", filepath);
                    await _userService.UpdateProfilePicture(User.Identity.GetIdentityUserId(), filepath);
                    return HttpResponse(200, "Your information saved successfully.", filepath);

                }
                return ValidationResponse(new string[] { "Please upload file first.." }.ToList());
            }
            else
            {
                return ErrorResponse(401, "Unauthorized Access");
            }


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }


    //[Route("login")]
    //[HttpPost]

    //public async Task<dynamic> Login(string userName, string password, string device)
    //{
    //    var user = await _courseService.CourseUserCrudService.GetAsync("Where Email=@Email and IsActive=1 and password=@Password",
    //        new { Email = userName, Password = password });
    //    if (user == null)
    //    {
    //        return HttpResponse(400, "invalid user");
    //    }
    //    if (user != null)
    //    {
    //        if (!user.AllowMultipleLogin)
    //        {

    //            var history =
    //                await _courseService.LoginHistoryCrudService.GetListAsync("Where CourseUserId=@CourseUserId",
    //                    new { CourseUserId = user.CourseUserId });
    //            if (history != null && history.Any())
    //            {
    //                if (!history.Any(h => h.Device.ToLower() == device.ToLower().Trim()))
    //                {
    //                    return HttpResponse(400, "multiple device login detected.");
    //                }
    //            }
    //        }
    //    }
    //    //var tokenResponse = await RequestToken(userName, password);
    //    //string token = "", rfTorken = "";
    //    //if (tokenResponse.IsError)
    //    //{
    //    //    return ErrorResponse(500, tokenResponse.ErrorDescription);
    //    //}
    //    //else
    //    //{
    //    //    token = tokenResponse.AccessToken;
    //    //    rfTorken = tokenResponse.RefreshToken;
    //    //    user.Token = token;
    //    //    user.RefreshToken = rfTorken;
    //    //}
    //    var userCourse = await _courseService.UserCourseMappingService.GetListAsync("Where CourseUserId=@CourseUserId",
    //        new { CourseUserId = user.CourseUserId });
    //    return HttpResponse(200, "success", new { User = user, Course = userCourse });
    //}

    [Route("login/history")]
    /// <summary>
    /// Saves the login history of the currently authenticated user.
    /// </summary>
    /// <param name="history">UserLoginHistory object containing login details.</param>
    /// <returns>200 on success, 500 on error.</returns>
    [HttpPost]
    // [AllowAnonymous]
    public async Task<dynamic> SaveLoginHistory(UserLoginHistory history)
    {
        try
        {
            _logger.Log(LogType.Trace, () => "login history", history);
            //foreach (var history in histories)
            //{
            history.AutoFill();
            history.UserId = (long)User.Identity.GetIdentityUserId();
            if (string.IsNullOrEmpty(history.IpAddress))
                history.IpAddress = ControllerContext.HttpContext.Connection.RemoteIpAddress.ToString();


            // }
            return HttpResponse(200, "success");
        }
        catch (Exception e)
        {
            return HttpResponse(500, e.Message.ToLower());
        }
    }

    /// <summary>
    /// update mobile users profice picture
    /// </summary>
    /// <param name="model"></param>
    /// <returns>return status </returns>
    [Route("picture/update")]
    [HttpPost]
    public async Task<dynamic> UpdatePicture(ProfilePictureUpdateRequest model)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() == 0)
            {
                //ModelState.AddModelError(model.IdentityUserId.ToString(), "Invalid user.");
                return ErrorResponse(500, "Invalid User");
            }
            if (string.IsNullOrEmpty(model.ImagePath))
            {
                ModelState.AddModelError(model.ImagePath, "Invalid image path.");
            }
            if (ModelState.IsValid)
            {
                await _userService.UpdateProfilePicture(User.Identity.GetIdentityUserId(), model.ImagePath);
                return HttpResponse(200, "Your information saved successfully.", true);

            }
            else
            {
                return ValidationResponse(ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }

    [Route("changepassword")]
    /// <summary>
    /// Changes the password for the logged-in user.
    /// </summary>
    /// <param name="model">ChangePasswordViewModel containing old and new passwords.</param>
    /// <returns>200 if password changed, 500 if failed, NotAuthorizedResponse if user not logged in.</returns>

    [HttpPost]
    public async Task<dynamic> ChangePassword(ChangePasswordRequest model)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() > 0)
            {
                var user = await _userManager.FindByIdAsync(User.Identity.GetIdentityUserId().ToString());
                var status = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                if (status.Succeeded)
                    return HttpResponse(200, "Password changed successfully.", true);
                else
                    return HttpResponse(500, "Unable to change password.", false);
            }
            else
            {
                return NotAuthorizedResponse();
            }




        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    [Route("forgotpassword/otp")]
    /// <summary>
    /// Sends a password reset email to the user.
    /// </summary>
    /// <param name="email">User's email address.</param>
    /// <returns>200 if reset email sent, 500 if error.</returns>
    [HttpPost]


    public async Task<dynamic> ForgotPassword([FromBody] ForgotPasswordRequest model)
    {
        try
        {
            var message = "If your email is registered, an OTP has been sent.";

            // 1. Find User
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                await Task.Delay(500); // Security delay
                return HttpResponse(200, "Success", message);
            }


            long userId = user.Id; // Ensure this matches your DB schema

            // 3. Generate OTP using your Service
            string otpCode = await _otpService.Generate(userId);



            // 5. Send Email
            // 3. Create Email Body (String Manipulation - NO TEMPLATE)
            var appUser = await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@Id", new { Id = userId });
            string firstName = appUser?.FirstName ?? "User";

            // 5. Send Email
            await _emailSender.SendTemplatedEmailAsync(
                "Reset Password OTP",
                "emailtemplates/passwordreseted.html",
                new
                {
                    Name = firstName,
                    Code = otpCode,
                    Date = DateTime.Now.ToString("yyyy"),
                    CurrentDate = DateTime.Now.ToString("dd MMM yyyy"),
                    Link = ("https://lmsaccount.humanedgenepal.com/account/forgotpassword")


                },
                new EmailAddress[] { new EmailAddress { Email = user.Email, DisplayName = firstName } }
            );

            return HttpResponse(200, "Success", message);


        }
        catch (Exception ex)
        {
            return ErrorResponse(500, ex.Message);
        }
    }
    [Route("verifyotp")]
    [HttpPost]
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    public async Task<dynamic> VerifyOTP([FromBody] VerifyOtpRequest model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return ErrorResponse(400, "Invalid request.");

            long userId = user.Id;

            // 1. Use your service to verify
            bool isValid = await _otpService.Verify(model.OtpCode, userId);

            if (isValid)
            {

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

                return HttpResponse(200, "OTP Verified", new
                {
                    IsVerified = true,
                    ResetToken = resetToken
                });
            }
            else
            {
                return ErrorResponse(400, "Invalid or Expired OTP.");
            }
        }
        catch (Exception ex)
        {
            return ErrorResponse(500, ex.Message);
        }
    }
    [HttpPost]
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    [Route("reset-password")]
    public async Task<dynamic> ResetPassword([FromBody] RestPasswordRequest model)
    {
        try
        {
            if (model.NewPassword != model.ConfirmPassword)
            {
                return ErrorResponse(400, "Passwords do not match.");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return ErrorResponse(400, "User not found.");


            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (result.Succeeded)
            {

                return HttpResponse(200, "Password has been reset successfully.");
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ErrorResponse(400, "Reset failed: " + errors);
            }
        }
        catch (Exception ex)
        {
            return ErrorResponse(500, ex.Message);
        }
    }

    [Route("email/send")]
    /// <summary>
    /// Sends a verification email to the user.
    /// </summary>
    /// <param name="emailorUserName">Email or username of the user.</param>
    /// <returns>200 if verification email sent, 500 if error.</returns>
    [HttpPost]
    public async Task<dynamic> SendVerificationEmail(string emailorUserName)
    {
        try
        {

            var user = emailorUserName.Contains("@") == true ? await _userManager.FindByEmailAsync(emailorUserName) : await _userManager.FindByNameAsync(emailorUserName);
            if (user != null)
            {
                var appuser =
                    await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@Id", new { Id = user.Id });
                // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                string otp = await _otpService.Generate(user.Id);
                var callbackUrl =
                    $"https://auth.LMS.com/account/ConfirmEmail?code={otp}&userName={appuser.UserName}"; //Url.ResetPasswordCallbackLink(user.UserName.ToString(), code, Request.Scheme);
                // Url.EmailConfirmationLink(user.UserName.ToString(), code, Request.Scheme);

                _logger.Log(LogType.Info, () => callbackUrl);
                // await _emailSender.SendEmailConfirmationAsync(model.Email, callbackUrl);

                await _emailSender.SendTemplatedEmailAsync("Verify Your Email",
                    "emailtemplates/ok_email_verify.html", new
                    {
                        VerificationLink = callbackUrl,
                        Name = $"{appuser.FirstName} {appuser.LastName}"
                    }, new EmailAddress[]
                    {
                        new EmailAddress
                        {
                            Email = appuser.Email,
                            DisplayName = $"{appuser.FirstName} {appuser.LastName}"

                        }
                    });
                //  _logger.Log(LogType.Info, () => $"Reset Password,Please reset your password by clicking here: <a href='{callbackUrl}'>link</a>{to.ToArray()}");

                //await _emailSender.SendEmailAsync("Reset Password",
                //    $"Please reset your password by clicking here: <a href='{callbackUrl}'>link</a>", to.ToArray());
            }
            return HttpResponse(200, "Reset email has been sent to your email.", true);



        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }

    }



    [Route("save")]
    [HttpPost]
    //[NeedIdempotency]
    /// <summary>
    /// Updates the profile of the logged-in user.
    /// </summary>
    /// <param name="model">AppUser model containing updated information.</param>
    /// <returns>200 if updated successfully, validation errors if invalid, 500 if unauthorized or error.</returns>

    public async Task<dynamic> Save(AppUser model)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() > 0)
            {
                if (ModelState.IsValid)
                {
                    var existing = await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@ID", new { ID = User.Identity.GetIdentityUserId() });
                    existing.FirstName = model.FirstName;
                    string lastName = model.LastName;
                    if (string.IsNullOrEmpty(lastName))
                        lastName = " ";
                    existing.LastName = lastName;

                    existing.AutoFill();
                    existing.IsActive = true;
                    //appuser.GroupName = existing.GroupName;

                    //appuser.OrganizationId = model.OrganizationId;
                    // model.Email = existing.Email;
                    if (model.ProfilePictureFile != null)
                    {
                        string filepath = await _storageProvider.Save("User", model.ProfilePictureFile);
                        existing.ProfilePicture = filepath;
                    }
                    existing.PhoneNumber = model.PhoneNumber;
                    await _userService.AppUserCrudService.UpdateAsync(existing);
                    return HttpResponse(200, "Your information saved successfully.", model);

                }
                else
                {
                    return ValidationResponse(
                        ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
                }
            }
            else
            {
                return ErrorResponse(500, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(500, e.Message);
        }
    }



}