// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;
using YangOne.Admin.Dto;
using YangOne.Identity.Extensions;
using YangOne.Log;
using YangOne.Web.API;
using YangOne.Web.Model;
using YangOne.Web.Service;

namespace YandOne.Admin.API;

[Route("api/v1/timezone")]
/// <summary>
/// Represents a class TimeZoneApiController.
/// </summary>
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
    public async Task<ActionResult<ApiResponse<IEnumerable<Timezone>>>> GetAll()
    {
        try
        {
            var data = await _timeZoneService.GetAllTimeZones();
            return SuccessResponse("Success", data);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<IEnumerable<Timezone>>(501, e.Message);
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<Timezone>>> GetById(int id)
    {
        try
        {
            var tz = await _timeZoneService.TimeZoneCrudService.GetAsync(id);
            if (tz == null)
                return ErrorResponse<Timezone>(404, "TimeZone not found");

            return SuccessResponse("Success", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Timezone>(501, e.Message);
        }
    }

    [HttpGet("check/user")]
    public async Task<ActionResult<ApiResponse<Timezone>>> CheckUserHasTimeZone()
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<Timezone>();

            var tz = await _timeZoneService.CheckUserHasTimeZone(currentUserId);
            return SuccessResponse("Success", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Timezone>(501, e.Message);
        }
    }

    [HttpPost("save/user-timezone")]
    public async Task<ActionResult<ApiResponse<Timezone>>> SaveUserTimeZone([FromBody] SaveUserTimeZoneRequest request)
    {
        try
        {
            var currentUserId = User.Identity.GetIdentityUserId();
            if (currentUserId == 0)
                return NotAuthorizedResponse<Timezone>();

            var tz = await _timeZoneService.SaveUserTimeZone(request.UserId, request.TimeZoneId);
            return SuccessResponse("Saved successfully", tz);
        }
        catch (Exception e)
        {
            _logger.Log(LogType.Error, () => e.Message, e);
            return ErrorResponse<Timezone>(501, e.Message);
        }
    }
}
