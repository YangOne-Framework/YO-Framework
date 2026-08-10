// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
#nullable enable
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using YangOne.Identity.Extensions;
using YangOne.Log;

namespace YangOne.Web.API
{
 


    [LogError]
    [ApiAuthorize]
    [EnableRateLimiting("StrictPolicy")]
    [ApiController]
    /// <summary>
    /// Base API controller with typed response helpers for success, validation, authorization and error responses.
    /// </summary>
    public abstract class BaseApiController : ControllerBase
    {
        private string _sessionCode;

        protected string SessionCode
        {
            get => User?.Identity?.GetSessionId() ?? _sessionCode;
            set => _sessionCode = value;
        }

        protected ApiResponse<T> CreateResponse<T>(int code, string msg, T? data = default, string[]? errors = null)
        {
            return new ApiResponse<T>
            {
                Code = code,
                Message = msg,
                Data = data,
                Errors = errors ?? Array.Empty<string>()
            };
        }

        #region Success helpers

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> HttpResponse<T>(int statusCode, string msg, T? data)
        {
            var response = CreateResponse(statusCode, msg, data);
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> HttpResponse(int statusCode, string msg)
        {
            var response = CreateResponse<object>(statusCode, msg, null);
            return StatusCode(statusCode, response);
        }


        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> SuccessResponse<T>(string msg, T? data)
        {
            var response = CreateResponse(StatusCodes.Status200OK, msg, data);
            return Ok(response);
        }

        #endregion

        #region Validation / auth / error helpers

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ValidationResponse(List<string>? errors)
        {
            var response = CreateResponse<object>(
                600,
                "Validation Error",
                null,
                errors?.ToArray()
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> ValidationResponse<T>(List<string>? errors)
        {
            var response = CreateResponse<T>(
                600,
                "Validation Error",
                default,
                errors?.ToArray()
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> NotAuthorizedResponse(string? message = null)
        {
            var response = CreateResponse<object>(
                StatusCodes.Status401Unauthorized,
                message ?? "Unauthorized Request",
                null,
                new[] { "Access Denied" }
            );

            return Unauthorized(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> NotAuthorizedResponse<T>(string? message = null)
        {
            var response = CreateResponse<T>(
                StatusCodes.Status401Unauthorized,
                message ?? "Unauthorized Request",
                default,
                new[] { "Access Denied" }
            );

            return Unauthorized(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ErrorResponse(int statusCode, string msg)
        {
            var response = CreateResponse<object>(statusCode, msg, null, new[] { msg });
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ErrorResponse(int statusCode, string msg, object? data)
        {
            var response = CreateResponse<object>(statusCode, msg, data, new[] { msg });
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> ErrorResponse<T>(int statusCode, string msg)
        {
            var response = CreateResponse<T>(statusCode, msg, default, new[] { msg });
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ErrorResponse(string[] msgs)
        {
            var response = CreateResponse<object>(
                (int)HttpStatusCode.BadRequest,
                "Error",
                null,
                msgs
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> ErrorResponse<T>(string[] msgs)
        {
            var response = CreateResponse<T>(
                (int)HttpStatusCode.BadRequest,
                "Error",
                default,
                msgs
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ErrorResponse(ModelStateDictionary modelState, int code, object? data)
        {
            var errorMessages = modelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage)
                .ToArray();

            var response = CreateResponse<object>(
                code,
                "Validation Failed",
                data,
                errorMessages
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> ErrorResponse<T>(ModelStateDictionary modelState, int code, object? data)
        {
            var errorMessages = modelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage)
                .ToArray();

            var response = CreateResponse<T>(
                code,
                "Validation Failed",
                default,
                errorMessages
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<object>> ExceptionResponse(Exception ex, object? data = null)
        {
            var response = CreateResponse<object>(
                StatusCodes.Status500InternalServerError,
                ex.Message,
                data,
                new[] { ex.Message }
            );

            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected ActionResult<ApiResponse<T>> ExceptionResponse<T>(Exception ex, object? data = null)
        {
            var response = CreateResponse<T>(
                StatusCodes.Status500InternalServerError,
                ex.Message,
                default,
                new[] { ex.Message }
            );

            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        #endregion

        #region IActionResult helpers (for endpoints returning IActionResult with [ResponseData] attribute)

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult Success(string msg, object? data)
        {
            return Ok(CreateResponse<object>(StatusCodes.Status200OK, msg, data));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult HttpResult(int statusCode, string msg, object? data)
        {
            return StatusCode(statusCode, CreateResponse<object>(statusCode, msg, data));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult HttpResult(int statusCode, string msg)
        {
            return StatusCode(statusCode, CreateResponse<object>(statusCode, msg, null));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ValidationError(List<string>? errors)
        {
            return BadRequest(CreateResponse<object>(600, "Validation Error", null, errors?.ToArray()));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult NotAllowed(string? message = null)
        {
            return Unauthorized(CreateResponse<object>(StatusCodes.Status401Unauthorized, message ?? "Unauthorized Request", null, new[] { "Access Denied" }));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult Fail(int statusCode, string msg)
        {
            return StatusCode(statusCode, CreateResponse<object>(statusCode, msg, null, new[] { msg }));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult Fail(string[] msgs)
        {
            return BadRequest(CreateResponse<object>((int)HttpStatusCode.BadRequest, "Error", null, msgs));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult Fail(ModelStateDictionary modelState, int code, object? data)
        {
            var errorMessages = modelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage)
                .ToArray();
            return BadRequest(CreateResponse<object>(code, "Validation Failed", data, errorMessages));
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ExceptionFail(Exception ex, object? data = null)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, CreateResponse<object>(StatusCodes.Status500InternalServerError, ex.Message, data, new[] { ex.Message }));
        }

        #endregion
    }

    //[ProducesResponseType(typeof(ApiResponse<IEnumerable<Accessibility>>), StatusCodes.Status200OK)]
    //[ProducesResponseType(typeof(ApiResponse<object>), 501)]
    //public async Task<ActionResult<ApiResponse<object>>> GetAllActive(
    //    [FromQuery] int offset = 1,
    //    [FromQuery] int limit = 20,
    //    [FromQuery] string query = "")
    //{
    //    try
    //    {
    //        var data = await _accessibilityService.GetActivePagedAsync(offset, limit, query);
    //        return Ok(CreateResponse(StatusCodes.Status200OK, "Success", data, null));
    //    }
    //    catch (Exception e)
    //    {
    //        _logger.Log(LogType.Error, () => e.Message, e);
    //        return ErrorResponse(501, e.Message);
    //    }
    //}

    //[HttpGet("{id:int}")]
    //[ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    //[ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    //[ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    //public ActionResult<ApiResponse<UserDto>> GetById(int id)
    //{
    //    var dto = new UserDto(id, "Binod");
    //    return SuccessResponse("OK", dto);
    //}

}
