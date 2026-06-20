// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
#nullable enable
namespace YangOne.Web.API
{
    /// <summary>
    /// Specifies the concrete data type for OpenAPI response schema generation on IActionResult endpoints.
    /// Place this on controller methods that return IActionResult with ApiResponse data.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class ResponseDataAttribute : Attribute
    {
        public Type DataType { get; }
        public ResponseDataAttribute(Type dataType)
        {
            DataType = dataType;
        }
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
