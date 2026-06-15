using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/timezone")]
public class TimeZoneApiController : BaseApiController
{
    private readonly ILogger _logger;
    private readonly ITimeZoneService _timeZoneService;

    public TimeZoneApiController(ILogger logger, ITimeZoneService timeZoneService)
    {
        _logger = logger;
        _timeZoneService = timeZoneService;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var data = await _timeZoneService.GetAllTimeZones();
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var tz = await _timeZoneService.TimeZoneCrudService.GetAsync(id);
            if (tz == null)
                return ErrorResponse(404, "TimeZone not found");

            return SuccessResponse("Success", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpGet("check/user")]
    public async Task<IActionResult> CheckUserHasTimeZone()
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse();

            var tz = await _timeZoneService.CheckUserHasTimeZone(currentUserId);
            return SuccessResponse("Success", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }

    [HttpPost("save/user-timezone")]
    public async Task<IActionResult> SaveUserTimeZone([FromBody] SaveUserTimeZoneRequest request)
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse();

            var tz = await _timeZoneService.SaveUserTimeZone(request.UserId, request.TimeZoneId);
            return SuccessResponse("Saved successfully", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse(501, e.Message);
        }
    }
}