// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections;
using YangOne.Web.Service;
using YangOne.Web.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using YangOne.Configuration;
using YangOne.Extensions;
using YangOne.Identity;
using YangOne.Identity.Dto;
using YangOne.Identity.Service;
using YangOne.Installer;
using YangOne.Web.Services;
using IdentityUser = YangOne.Identity.Model.IdentityUser;
using IdentityRole = YangOne.Identity.Model.IdentityRole;
namespace YangOne.Web
{
    public class InstallerController : Controller
    {
        private readonly IConfiguration _configuration;
        private readonly IYangOneConfigurationManager _yoManager;
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IEmailSender _emailSender;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IIdentityRoleService _identityRoleService;
        private readonly IAppUserService _appUserService;
        private readonly ISettingService _settingService;
        private readonly YangOneAppConfig _appConfig;

        public InstallerController(IConfiguration configuration,
            IOptionsSnapshot<YangOneAppConfig> yoConfig,
            IYangOneConfigurationManager yoManager,
            UserManager<IdentityUser> userManager,
            //IEmailSender emailSender,
            SignInManager<IdentityUser> signInManager,
            IIdentityRoleService identityRoleService,
            IAppUserService appUserService, ISettingService settingService)
        {
            _configuration = configuration;
            _yoManager = yoManager;
            _userManager = userManager;
            //_emailSender = emailSender;
            _signInManager = signInManager;
            _identityRoleService = identityRoleService;
            _appUserService = appUserService;
            _settingService = settingService;
            _appConfig = yoConfig.Value;
        }
        [Route("install")]
        public async Task<IActionResult> Index()
        {
            if (_appConfig.IsInstalled)
            {
                return Redirect("/");
            }
            var model = new InstallerViewModel();
            return PartialView("_Installer", model);
        }
        [Route("install/ping")]
        public Task<string> Ping()
        {
            return Task.FromResult("pong");
        }

        [Route("install")]
        [HttpPost]        
        public async Task<JsonResult> Install(InstallerViewModel model)
        {
            if (_appConfig.IsInstalled==true)
            {
                return Json(new { Code = 500, Data = model, Message = "Already installed" });
            }
            try
            {

                var connectionString = model.ToString();
                if (await _yoManager.Install(connectionString, model.DatabaseProvider))
                {
                    return Json(new { Code = 200, Data = model, Message = "Installed Successfully." });
                }
                else
                {
                    return Json(new { Code = 500, Data = model, Message = "Something went wrong!Try using new database for setup." });
                }
            }
            catch (DivideByZeroException e)
            {
                return Json(new { Code = 500, Data = model, Message = "Connection String Error." });
            }
            catch (Exception e)
            {
                return Json(new { Code = 500, Data = model, Message = e.Message });
            }
        }

        [Route("install/checkconnection")]
        [HttpPost]
        public async Task<JsonResult> CheckConnection(InstallerViewModel model)
        {
            if (_appConfig.IsInstalled == true)
            {
                return Json(new { Code = 500, Data = model, Message = "Already installed" });
            }
            try
            {
                var connectionString = model.ToString();
                if (await _yoManager.CheckConnection(connectionString, model.DatabaseProvider))
                {
                    return Json(new { Code = 200, Data = model, Message = "Database connected successfully." });
                }
                else
                {
                    return Json(new { Code = 500, Data = model, Message = "Connection failed.Try Again." });
                }
            }
            catch (Exception e)
            {
                return Json(new { Code = 500, Data = model, Message = e.Message });
            }
        }


        [Route("install/setupadmin")]
        [HttpPost]
        public async Task<JsonResult> SetUpAdmin(InstallerUserViewModel model)
        {
            if (_appConfig.IsInstalled == true)
            {
                return Json(new { Code = 500, Data = model, Message = "Already installed" });
            }
            try
            {

                if (ModelState.IsValid)
                {
                    var user = new IdentityUser { UserName = model.Email, Email = model.Email };
                    var userVm = user.To<NewUser>();
                    userVm.Password = model.Password;
                    userVm.FirstName = "First Name";
                    userVm.LastName = "Last Name";
                    userVm.AddedBy = 1;//model.Email;
                    userVm.IsActive = true;
                    userVm.UserRoles = new List<UserRolesSelected>
                    {
                        new UserRolesSelected{IsSelected = true,RoleId = YORoles.SuperAdmin}
                    };

                    var result = await _appUserService.SaveNewUserAsync(userVm);
                    if (!result.HasError)
                    {
                        await _signInManager.PasswordSignInAsync(model.Email, model.Password, true, lockoutOnFailure: false);
                        var defaultSetting = await _settingService.GetSetting();
                        defaultSetting.WebsiteName = model.SiteName;
                        defaultSetting.TimeZoneId = model.TimeZoneId;
                        await _settingService.SaveSetting(defaultSetting);
                        return Json(
                            new
                            {
                                Code = StatusCodes.Status201Created,
                                Message = "User Account Registered successfully.",
                                Data = user
                            });
                    }
                    return Json(new
                    {
                        Code = StatusCodes.Status412PreconditionFailed,
                        Message = result.Message,
                        Data = new ArrayList()

                    });
                }
                return Json(
                    new
                    {
                        Code = StatusCodes.Status406NotAcceptable,
                        Message = "Invalid inputs",
                        Data = ModelState.Values.SelectMany(x => x.Errors).Select(e => e.ErrorMessage).ToList()
                    });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

    }
}
