// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Services;

namespace YangOne.Admin.API;

[Route("api/v1/misc")]
/// <summary>
/// Represents a class MiscAPIController.
/// </summary>
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
    public async Task<ActionResult<ApiResponse<IEnumerable<Country>>>> GetAllCountries()
    {
        try
        {
            var data = await _countryService.CountryCrudService.GetListAsync();
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Country>>(501, e.Message);
        }
    }


}
