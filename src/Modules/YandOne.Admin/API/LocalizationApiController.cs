using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using YangOne.Admin.Dto;
using YangOne.Data;
using YangOne.Data.Extension;
using YangOne.Identity.Extensions;
using YangOne.Localization;
using YangOne.Log;
using YangOne.Web;
using YangOne.Web.API;
using YangOne.Web.Localization;
using YangOne.Web.Service;
using YangOne.Web.Services;
using LocaleResource = YangOne.Web.Localization.LocaleResource;

namespace YandOne.Admin.API;


[Route("api/v1/localization")]
public class LocalizationApiController : BaseApiController
{
    private readonly ILocaleService _localeService;
    private readonly ICountryService _countryService;
    private readonly ISettingService _settingService;
    private readonly IExportService _exportService;
    private readonly IImportService _importService;
    private readonly ILogger _logger;

    public LocalizationApiController(
        ILocaleService localeService,
        ICountryService countryService,
        ISettingService settingService,
        IExportService exportService,
        IImportService importService,
        ILogger logger)
    {
        _localeService = localeService;
        _countryService = countryService;
        _settingService = settingService;
        _exportService = exportService;
        _importService = importService;
        _logger = logger;
    }

    [HttpGet("region/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetRegions(
        [FromQuery] int pageNo = 1,
        [FromQuery] int rowsPerPage = 10,
        [FromQuery] string query = "")
    {
        try
        {
            var model = await _localeService.GetLocaleRegions(pageNo, rowsPerPage, query);
            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("region/byid/{regionId}")]
    public async Task<IActionResult> GetRegionById([FromRoute] int regionId )
    {
        try
        {
            var model = await _localeService.RegionCrudService.GetAsync(regionId);
            return SuccessResponse("Success", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }


    [HttpGet("country/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetCountries()
    {
        try
        {
            var countries = await _countryService.CountryCrudService.GetListAsync();
            return SuccessResponse("Success", countries);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("import")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Import([FromForm] LocalizationImportRequest request)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (request.ImportFile == null || request.ImportFile.Length == 0)
                return ErrorResponse(400, "Upload file is required.");

            var importedDatas = _importService.Import<LocaleResourcesImportModel>(request.ImportFile);

            var status = await _localeService.ImportLocaleResources(importedDatas, User.Identity.GetUserName());
            if (!status.IsImported)
                return ErrorResponse(500, status.Error ?? "Import failed.");

            return SuccessResponse("Data has been imported successfully.", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

  
    [HttpPost("region/new")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> CreateRegion([FromBody] LocaleRegion model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();

            if (model.LocaleRegionId != 0)
                return ErrorResponse(400, "LocaleRegionId must be 0 for creation.");

            var exists = await _localeService.CheckAlreadyExist(model.CountryId, model.Culture);
            if (exists)
                return ErrorResponse(409, "Localization already exists.");

            var countries = await _countryService.CountryCrudService.GetListAsync();
            var flagName = countries.FirstOrDefault(x => x.CountryId == model.CountryId)?.ISO;
            model.Flag = (flagName ?? "unknown") + ".png";

            await _localeService.RegionCrudService.InsertAsync<int>(model);
            await _localeService.AddNewResourceFromBaseCultureAsync(model.Culture);

            return SuccessResponse("Saved successfully", model);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }


    [HttpPost("region/update")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateRegion([FromBody] LocaleRegionEditViewModel model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            if (model.LocaleRegionId <= 0 || model.LocaleRegionId != model.LocaleRegionId)
                return ErrorResponse(400, "Invalid locale region id.");

            model.AutoFill();

            var countries = await _countryService.CountryCrudService.GetListAsync();
            var flagName = countries.FirstOrDefault(x => x.CountryId == model.CountryId)?.ISO;
            model.Flag = (flagName ?? "unknown") + ".png";

            await _localeService.RegionCrudService.UpdateAsync(model);

            // preserve existing behavior
            if (!await _localeService.CheckAlreadyExist(model.CountryId, model.Culture))
            {
                await _localeService.AddNewResourceFromBaseCultureAsync(model.Culture);
            }

            return SuccessResponse("Updated successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpGet("region/{localRegionId:int}/resource/all")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> GetResources(
        [FromRoute] int localRegionId,
        [FromQuery] int pageNo = 1,
        [FromQuery] int limit = 20)
    {
        try
        {
            var webSetting = await _settingService.GetSetting();
            var model = await _localeService.GetAllResourcesAsync(localRegionId, webSetting.BaseCulture, pageNo, limit);


            return SuccessResponse("Success",
             model
            );
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpGet("export/{localRegionId:int}")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> Export([FromRoute] int localRegionId)
    {
        try
        {
            if (localRegionId <= 0)
                return ErrorResponse(400, "Invalid locale region id.");

            var webSetting = await _settingService.GetSetting();
            var model = await _localeService.GetAllResourcesForExportAsync(localRegionId, webSetting.BaseCulture);

            var culture = model.FirstOrDefault()?.Culture ?? webSetting.BaseCulture;
            var fileName = $"{culture}-locales.xlsx";

            var responseContent = await _exportService.Export<LocaleResourcesExportModel>(model.ToList(), fileName, "Sheet 1");
            var bytes = await responseContent.Content.ReadAsByteArrayAsync();

            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                fileName);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpPost("set-default")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> SetDefault([FromBody] SetDefaultLocaleRequest request)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, request);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var webSetting = await _settingService.GetSetting();
            var ok = await _localeService.SetDefaultAsync(request.LocaleRegionId);

            if (!ok)
                return ErrorResponse(500, "Unable to set default locale region.");

            webSetting.BaseCulture = request.Culture;
            await _settingService.SaveSetting(webSetting);

            return SuccessResponse("Default locale updated successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [AllowAnonymous]
    [HttpPost("resource/missing")]
    [DisableRateLimiting]
    public async Task<IActionResult> SaveMissingKeys([FromBody] Dictionary<string, string> missingKeys)
    {
        try
        {
            if (missingKeys == null || missingKeys.Count == 0)
                return SuccessResponse("No missing keys provided", true);

            var culture = Request.Headers["X-Culture"].FirstOrDefault()
                ?? Request.Headers["Accept-Language"].FirstOrDefault()?.Split(',').FirstOrDefault()?.Split(';').FirstOrDefault()?.Trim()
                ?? "en-us";
            culture = culture.ToLowerInvariant();

            var dbFactory = DbFactoryProvider.GetFactory();
            using var db = dbFactory.GetConnection();

            foreach (var kvp in missingKeys)
            {
                var groupName = kvp.Key.Contains('.') ? kvp.Key.Split('.')[0] : "";

                await db.ExecuteAsync(
                    "if(Not Exists(select 1 from LocaleResource where LTRIM(RTRIM(Name))=LTRIM(RTRIM(@Name)) and LTRIM(RTRIM(Culture))=LTRIM(RTRIM(@Culture)) and LTRIM(RTRIM(GroupName))=LTRIM(RTRIM(@GroupName)))) " +
                    "BEGIN Insert into LocaleResource(Culture,Name,Value,GroupName) values(@Culture,@Name,@Value,@GroupName); END",
                    new { Name = kvp.Key, Culture = culture, Value = kvp.Value ?? kvp.Key, GroupName = groupName });
            }

            if (ContextResolver.Context.RequestServices.GetService(typeof(ResourceBuilder)) is ResourceBuilder rb)
                await rb.Build();

            return SuccessResponse("Missing keys saved successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }


    [HttpPost("resource/save")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> UpdateLocaleValue([FromBody] LocaleResource model)
    {
        if (!ModelState.IsValid)
            return ErrorResponse(ModelState, 600, model);

        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            model.AutoFill();
            await _localeService.CrudService.UpdateAsync(model);

            return SuccessResponse("Locale resource updated successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

   
    [HttpDelete("region/{id:int}")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> DeleteRegion([FromRoute] int id)
    {
        try
        {
            var userId = User.Identity.GetIdentityUserId();
            if (userId == 0)
                return NotAuthorizedResponse();

            var region = await _localeService.RegionCrudService.GetAsync(id);
            if (region == null)
                return ErrorResponse(404, "Locale region not found.");

            await _localeService.CrudService.DeleteAsync("Where Culture=@Culture", new { region.Culture });
            await _localeService.RegionCrudService.UpdateAsDeleted(id);

            return SuccessResponse("Deleted successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }


    [HttpPost("language")]
   // [Authorize(Roles = "Admin,SuperAdmin")]
    public IActionResult SetLanguage([FromBody] SetLanguageRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Culture))
                return ErrorResponse(400, "Culture is required.");

            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(request.Culture)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );

            return SuccessResponse("Language cookie set successfully", true);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}
 