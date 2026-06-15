#nullable enable
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.RateLimiting;
using System.Net;
using YangOne.Identity.Extensions;
using YangOne.Log;

namespace YangOne.Web.API
{
    public class ApiResponse<T>
    {
        public int Code { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public string[] Errors { get; set; }

        public ApiResponse()
        {
            Errors = Array.Empty<string>();
        }
    }
    [LogError]
    [ApiAuthorize]
    [EnableRateLimiting("StrictPolicy")]
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        private string _sessionCode;

        protected string SessionCode
        {
            get => User?.Identity?.GetSessionId() ?? _sessionCode;
            set => _sessionCode = value;
        }

        // Helper to create the standard object structure
        private ApiResponse<object> CreateResponse(int code, string msg, object? data, string[]? errors)
        {
            return new ApiResponse<object>
            {
                Code = code,
                Message = msg,
                Data = data,
                Errors = errors ?? Array.Empty<string>()
            };
        }

        #region Success helpers

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult HttpResponse(int statusCode, string msg, object? data)
        {
            var response = CreateResponse(statusCode, msg, data, null);
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult HttpResponse(int statusCode, string msg)
        {
            var response = CreateResponse(statusCode, msg, null, null);
            return StatusCode(statusCode, response);
        }

        // NOTE: To keep standard format, 'CurrentPage' is wrapped inside an anonymous object in Data.
        // If you put 'CurrentPage' at the root, you break the standard schema.
        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult HttpResponse(int statusCode, string msg, object? data, int currentPage = 1)
        {
            var pagedData = new { Result = data, CurrentPage = currentPage };
            var response = CreateResponse(statusCode, msg, pagedData, null);

            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult SuccessResponse(string msg, object? data)
        {
            var response = CreateResponse(StatusCodes.Status200OK, msg, data, null);
            return Ok(response);
        }

        #endregion

        #region Validation / auth / error helpers

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ValidationResponse(List<string>? errors)
        {
            var response = CreateResponse(
                600, // Custom code as per your request
                "Validation Error",
                null,
                errors?.ToArray()
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult NotAuthorizedResponse(string? message = null)
        {
            var response = CreateResponse(
                StatusCodes.Status401Unauthorized,
                message ?? "Unauthorized Request",
                null,
                new[] { "Access Denied" }
            );

            return Unauthorized(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ErrorResponse(int statusCode, string msg)
        {
            var response = CreateResponse(statusCode, msg, null, new[] { msg });
            return StatusCode(statusCode, response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ErrorResponse(string[] msgs)
        {
            var response = CreateResponse(
                (int)HttpStatusCode.BadRequest,
                "Error",
                null,
                msgs
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ErrorResponse(ModelStateDictionary modelState, int code, object? data)
        {
            var errorMessages = modelState.Values
                .SelectMany(x => x.Errors)
                .Select(x => x.ErrorMessage)
                .ToArray();

            var response = CreateResponse(
                code,
                "Validation Failed",
                data,
                errorMessages
            );

            return BadRequest(response);
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        protected IActionResult ExceptionResponse(Exception ex, object? data = null)
        {
            var response = CreateResponse(
                StatusCodes.Status500InternalServerError,
                ex.Message,
                data,
                new[] { ex.Message } // Or ex.StackTrace if in Development
            );

            return StatusCode(StatusCodes.Status500InternalServerError, response);
        }

        #endregion
    }


    [LogError]
    [ApiAuthorize]
    [EnableRateLimiting("StrictPolicy")]
    [ApiController]
    public abstract class BaseApiV2Controller : ControllerBase
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
        protected ActionResult<ApiResponse<object>> ErrorResponse(int statusCode, string msg)
        {
            var response = CreateResponse<object>(statusCode, msg, null, new[] { msg });
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