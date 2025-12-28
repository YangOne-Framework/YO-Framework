using Microsoft.AspNetCore.Mvc;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Services;

namespace YangOne.Admin.API;

[Route("api/v1/misc")]
public class MiscAPIController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly ICountryService _countryService;

    public MiscAPIController(ILogger logger, ICountryService countryService)
    {
        _logger = logger;
        _countryService = countryService;
    }

    /// <summary>
    /// User: Get all active trek regions (paged)
    /// </summary>
    [HttpGet]
    [Route("country/all")]
    public async Task<IActionResult> GetAllCountries()
    {
        try
        {
            var data = await _countryService.CountryCrudService.GetListAsync();
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
    //[Route("state/all")]
    //[HttpGet]
    //public async Task<IActionResult> GetStates(int countryId)
    //{
    //    try
    //    {

    //        var states = await _countryService.State.GetListAsync("Where CountryId=@CountryId", new { CountryId = countryId });

    //        return HttpResponse(200, "success", states);
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(500, e.Message);
    //    }
    //}


}