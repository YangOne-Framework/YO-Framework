// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
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
using YangOne.Admin.Dto;
using YangOne.Web.Services;
using IdentityUser = YangOne.Identity.Model.IdentityUser;

namespace YandOne.Admin.API;

[Route("api/v1/user")]
/// <summary>
/// Represents a class UserApiController.
/// </summary>
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
    public async Task<ActionResult<ApiResponse<IEnumerable<AppUser>>>> GetAllUsers(int offset = 1, int limit = 10, string search = "", string email = "", string phone = "",  string roleId = "")
    {
        var user = await _userService.GetAllUsers(offset, limit, search, email, phone, roleId);
        return HttpResponse(200, "success", user);


    }
    [Route("management/changepassword")]
    [HttpPost]
   
    public async Task<ActionResult<ApiResponse<bool>>> ChangePasswordByAdmin(ChangePasswordByAdminRequest model)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(model.IdentityUserId.ToString());
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (result.Succeeded)
                return HttpResponse<bool>(200, "Password changed successfully.", true);
            else
                return HttpResponse<bool>(500, "Unable to change password.", false);


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }

    }

    [Route("management/save")]
    [HttpPost]
    
    public async Task<ActionResult<ApiResponse<bool>>> SaveManagementUser([FromBody] AppUserRegisterModel model)
    {
        try
        {
            if (model.AppUserId == 0)
            {
                if (string.IsNullOrEmpty(model.Password) || model.Password.Length < 8)
                    return ErrorResponse<bool>(400, "Password must be at least 8 characters.");

                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null)
                    return ErrorResponse<bool>(400, "Email already registered.");

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
                    return HttpResponse<bool>(200, "User created successfully.", true);
                else
                    return ErrorResponse<bool>(500, "Failed to create user.");
            }
            else
            {
                var appUser = await _userService.AppUserCrudService.GetAsync(model.AppUserId);
                if (appUser == null)
                    return ErrorResponse<bool>(404, "User not found.");

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

                return HttpResponse<bool>(200, "User updated successfully.", true);
            }
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }
    }

    [Route("management/{id:int}")]
    [HttpGet]
    
    public async Task<ActionResult<ApiResponse<AppUser>>> GetManagementUserById(int id)
    {
        try
        {
            var appUser = await _userService.AppUserCrudService.GetAsync(id);
            if (appUser == null)
                return ErrorResponse<AppUser>(404, "User not found.");

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
            

            return HttpResponse<AppUser>(200, "success", appUser);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<AppUser>(500, e.Message);
        }
    }

    [Route("management/delete")]
    [HttpPost]
    
    public async Task<ActionResult<ApiResponse<bool>>> DeleteManagementUser([FromBody] dynamic model)
    {
        try
        {
            long userId = (long)model.AppUserId;
            var appUser = await _userService.AppUserCrudService.GetAsync(userId);
            if (appUser == null)
                return ErrorResponse<bool>(404, "User not found.");

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

            return HttpResponse<bool>(200, "User deleted successfully.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }
    }

    [Route("management/resetpassword")]
    [HttpPost]
    
    public async Task<ActionResult<ApiResponse<bool>>> ResetManagementPassword([FromBody] ChangePasswordByAdminRequest model)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(model.IdentityUserId.ToString());
            if (user == null)
                return ErrorResponse<bool>(404, "User not found.");

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            if (result.Succeeded)
                return HttpResponse<bool>(200, "Password reset successfully.", true);
            else
                return ErrorResponse<bool>(500, "Failed to reset password.");
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }
    }

    [Route("management/login-history/{userId:long}")]
    [HttpGet]
    
    public async Task<ActionResult<ApiResponse<IEnumerable<UserLoginHistory>>>> GetLoginHistory(long userId)
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
            return ErrorResponse<IEnumerable<UserLoginHistory>>(500, e.Message);
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

    public async Task<ActionResult<ApiResponse<AppUser>>> Profile()
    {
        if (User.Identity.GetIdentityUserId() > 0)
        {

            var user = await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@IdentityUserId", new { IdentityUserId = User.Identity.GetIdentityUserId() });

            return HttpResponse<AppUser>(200, "success", user);
        }
        else
        {
            return ErrorResponse<AppUser>(401, "Unauthorized Access");
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

    public async Task<ActionResult<ApiResponse<bool>>> CheckIsActive()
    {
        if (User.Identity.GetIdentityUserId() > 0)
        {

            var user = await _userService.AppUserCrudService.GetAsync(User.Identity.GetIdentityUserId());

            return HttpResponse<bool>(200, "success", user.IsActive);
        }
        else
        {
            return ErrorResponse<bool>(401, "Unauthorized Access");
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
    public async Task<ActionResult<ApiResponse<string>>> Generate(string newEmail, string newPhoneNumber, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse<string>(401, "Unauthorized Access");
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

            //sending new email verification
            if (!string.IsNullOrEmpty(newEmail))
            {
                var xuser = await _userManager.FindByEmailAsync(newEmail);
                if (xuser != null)
                {
                    return ErrorResponse<string>(500, "email already exists.");
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

return HttpResponse<string>(200, "success", otp);



        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(500, e.Message);
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
    public async Task<ActionResult<ApiResponse<bool>>> DeviceVerify(string device, string otp, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse<bool>(401, "Unauthorized Access");
            }
            var user = userName.Contains("@") == true ? await _userManager.FindByEmailAsync(userName) : await _userManager.FindByNameAsync(userName);

            var status = await _otpService.Verify(otp, user.Id);
            if (status)
            {
                var userdevice = await _deviceService.DeviceService.GetAsync("Where IsDeleted=@IsDeleted and DeviceId=@DeviceId and UserId=@UserId", new { IsDeleted = false, DeviceId = device, UserId = user.Id });
                userdevice.IsVerified = true;

                await _deviceService.DeviceService.UpdateAsync(userdevice);
                return HttpResponse<bool>(200, "success", true);
            }
            return HttpResponse<bool>(403, "Verifaction failed!", false);

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
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
    public async Task<ActionResult<ApiResponse<bool>>> ChangeEmail(string newEmail, string otp, string userName)
    {
        try
        {
            if (string.IsNullOrEmpty(userName))
            {
                return ErrorResponse<bool>(401, "Unauthorized Access");
            }
            var user = userName.Contains("@") == true ? await _userManager.FindByEmailAsync(userName) : await _userManager.FindByNameAsync(userName);

            var status = await _otpService.Verify(otp, user.Id);
            if (status)
            {
                var existingUser = await _userManager.FindByEmailAsync(newEmail);
                if (existingUser != null)
                {
                    return HttpResponse<bool>(403, "email already in use.", false);
                }
                else
                {
                    await _userService.ChangeEmailAsync(user.Id, newEmail);
                    var ux = await _userManager.FindByIdAsync(user.Id.ToString());
                    var token = await _userManager.GenerateEmailConfirmationTokenAsync(ux);
                    await _userManager.ConfirmEmailAsync(ux, token);
                    return HttpResponse<bool>(200, "success", true);
                }
            }

            return HttpResponse<bool>(403, "Verifaction failed!", false);


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
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
    public async Task<ActionResult<ApiResponse<bool>>> ChangePhone(string phoneNumber, string otp)
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

                    return HttpResponse<bool>(200, "success", true);
                }

                return HttpResponse<bool>(403, "Verifaction failed!", false);
            }
            else
            {
                return ErrorResponse<bool>(401, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
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
    public async Task<ActionResult<ApiResponse<bool>>> GetPhoneVerificationStatus()
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId > 0)
            {

                var user = await _userManager.FindByIdAsync(userId.ToString());
                var status = await _userManager.IsPhoneNumberConfirmedAsync(user);
                return HttpResponse<bool>(200, "success", status);

            }
            else
            {
                return ErrorResponse<bool>(401, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }

    }
   

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
    public async Task<ActionResult<ApiResponse<bool>>> Register(AppUserRegisterModel model)
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


                    var appuser =
                        await _userService.AppUserCrudService.GetAsync("Where IdentityUserId=@Id", new { Id = user.Id });
                    // var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                    string otp = await _otpService.Generate(user.Id);
                    var callbackUrl =
                        $"https://your-domain.com/account/ConfirmEmail?code={otp}&userName={appuser.UserName}"; //Url.ResetPasswordCallbackLink(user.UserName.ToString(), code, Request.Scheme);
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
                    return HttpResponse<bool>(487, "Thank you for registration. Please verify your email", true);
                }
                else
                {
                    return ErrorResponse<bool>(500, "Failed to add new user at the moment,Try again later. ");
                }
            }
            else
            {
                return ValidationResponse<bool>(ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
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
    public async Task<ActionResult<ApiResponse<string>>> UploadProfilePicture(IFormFile file)
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
                    return HttpResponse<string>(200, "Your information saved successfully.", filepath);

                }
                return ValidationResponse<string>(new string[] { "Please upload file first.." }.ToList());
            }
            else
            {
                return ErrorResponse<string>(401, "Unauthorized Access");
            }


        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<string>(500, e.Message);
        }

    }



    [Route("login/history")]
    /// <summary>
    /// Saves the login history of the currently authenticated user.
    /// </summary>
    /// <param name="history">UserLoginHistory object containing login details.</param>
    /// <returns>200 on success, 500 on error.</returns>
    [HttpPost]
    // [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> SaveLoginHistory(UserLoginHistory history)
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
            return HttpResponse<bool>(200, "success", true);
        }
        catch (Exception e)
        {
            return HttpResponse<bool>(500, e.Message.ToLower(), false);
        }
    }

    /// <summary>
    /// update mobile users profice picture
    /// </summary>
    /// <param name="model"></param>
    /// <returns>return status </returns>
    [Route("picture/update")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<bool>>> UpdatePicture(ProfilePictureUpdateRequest model)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() == 0)
            {
                //ModelState.AddModelError(model.IdentityUserId.ToString(), "Invalid user.");
                return ErrorResponse<bool>(500, "Invalid User");
            }
            if (string.IsNullOrEmpty(model.ImagePath))
            {
                ModelState.AddModelError(model.ImagePath, "Invalid image path.");
            }
            if (ModelState.IsValid)
            {
                await _userService.UpdateProfilePicture(User.Identity.GetIdentityUserId(), model.ImagePath);
return HttpResponse<bool>(200, "Your information saved successfully.", true);
  
            }
            else
            {
                return ValidationResponse<bool>(ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }
    }

    [Route("change-password")]
    /// <summary>
    /// Changes the password for the logged-in user.
    /// </summary>
    /// <param name="model">ChangePasswordViewModel containing old and new passwords.</param>
    /// <returns>200 if password changed, 500 if failed, NotAuthorizedResponse if user not logged in.</returns>

    [HttpPost]
    public async Task<ActionResult<ApiResponse<bool>>> ChangePassword(ChangePasswordRequest model)
    {
        try
        {
            if (User.Identity.GetIdentityUserId() > 0)
            {
                var user = await _userManager.FindByIdAsync(User.Identity.GetIdentityUserId().ToString());
                var status = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
                if (status.Succeeded)
                    return HttpResponse<bool>(200, "Password changed successfully.", true);
                else
                    return HttpResponse<bool>(500, "Unable to change password.", false);
            }
            else
            {
                return NotAuthorizedResponse<bool>();
            }




        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }

    }
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    [Route("forgot-password/otp")]
    /// <summary>
    /// Sends a password reset email to the user.
    /// </summary>
    /// <param name="email">User's email address.</param>
    /// <returns>200 if reset email sent, 500 if error.</returns>
    [HttpPost]


    public async Task<ActionResult<ApiResponse<string>>> ForgotPassword([FromBody] ForgotPasswordRequest model)
    {
        try
        {
            var message = "If your email is registered, an OTP has been sent.";

            // 1. Find User
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                await Task.Delay(500); // Security delay
                return HttpResponse<string>(200, "Success", message);
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

            return HttpResponse<string>(200, "Success", message);


        }
        catch (Exception ex)
        {
            return ErrorResponse<string>(500, ex.Message);
        }
    }
    [Route("verify-otp")]
    [HttpPost]
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    public async Task<ActionResult<ApiResponse<VerifyOtpResponseDto>>> VerifyOTP([FromBody] VerifyOtpRequestDto model)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return ErrorResponse<VerifyOtpResponseDto>(400, "Invalid request.");

            long userId = user.Id;

            // 1. Use your service to verify
            bool isValid = await _otpService.Verify(model.OtpCode, userId);

            if (isValid)
            {

                var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

                return HttpResponse<VerifyOtpResponseDto>(200, "OTP Verified", new VerifyOtpResponseDto(true, resetToken));
            }
            else
            {
                return ErrorResponse<VerifyOtpResponseDto>(400, "Invalid or Expired OTP.");
            }
        }
        catch (Exception ex)
        {
            return ErrorResponse<VerifyOtpResponseDto>(500, ex.Message);
        }
    }
    [HttpPost]
    [AllowAnonymous]
    [ExcludeFromPayloadProtection]
    [Route("reset-password")]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword([FromBody] ResetPasswordRequestDto model)
    {
        try
        {
            if (model.NewPassword != model.ConfirmPassword)
            {
                return ErrorResponse<bool>(400, "Passwords do not match.");
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return ErrorResponse<bool>(400, "User not found.");


            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);

            if (result.Succeeded)
            {

                return HttpResponse<bool>(200, "Password has been reset successfully.", true);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return ErrorResponse<bool>(400, "Reset failed: " + errors);
            }
        }
        catch (Exception ex)
        {
            return ErrorResponse<bool>(500, ex.Message);
        }
    }

    [Route("email/send")]
    /// <summary>
    /// Sends a verification email to the user.
    /// </summary>
    /// <param name="emailorUserName">Email or username of the user.</param>
    /// <returns>200 if verification email sent, 500 if error.</returns>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<bool>>> SendVerificationEmail(string emailorUserName)
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
                    $"https://your-domain.com/account/ConfirmEmail?code={otp}&userName={appuser.UserName}"; //Url.ResetPasswordCallbackLink(user.UserName.ToString(), code, Request.Scheme);
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
            return HttpResponse<bool>(200, "Reset email has been sent to your email.", true);



        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<bool>(500, e.Message);
        }

    }



    [Route("profile/save")]
    [HttpPost]
    //[NeedIdempotency]
    /// <summary>
    /// Updates the profile of the logged-in user.
    /// </summary>
    /// <param name="model">AppUser model containing updated information.</param>
    /// <returns>200 if updated successfully, validation errors if invalid, 500 if unauthorized or error.</returns>

    public async Task<ActionResult<ApiResponse<AppUser>>> Save(AppUser model)
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
                    return HttpResponse<AppUser>(200, "Your information saved successfully.", model);

                }
                else
                {
                    return ValidationResponse<AppUser>(
                        ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList());
                }
            }
            else
            {
                return ErrorResponse<AppUser>(500, "Unauthorized Access");
            }

        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<AppUser>(500, e.Message);
        }
    }



}
