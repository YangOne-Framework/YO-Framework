// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using Microsoft.AspNetCore.Mvc;

namespace YangOne.Storage
{
    /// <summary>
    /// Base exception for API errors with an associated HTTP status code.
    /// </summary>
    public class ApiException : System.Exception
    {
        private int code;
        public ApiException(int code, string msg) : base(msg)
        {
            this.code = code;
        }
    }
    /// <summary>
    /// Exception representing a bad request (HTTP 400).
    /// </summary>
    public class BadRequestException : ApiException
    {
        private int code;

        public BadRequestException(string msg) : base(400, msg)
        {
            this.code = 400;
        }

        public BadRequestException(int code, string msg) : base(code, msg)
        {
            this.code = code;
        }
    }
    /// <summary>
    /// Exception representing an invalid operation (HTTP 401).
    /// </summary>
    public class InvalidOperationException : ApiException
    {
        public InvalidOperationException(string msg) : base(401, msg)
        {

        }
    }
    /// <summary>
    /// Exception representing a resource not found (HTTP 404).
    /// </summary>
    public class NotFoundException : ApiException
    {
        public NotFoundException(string msg) : base(404, msg)
        {
        }
    }
    /// <summary>
    /// Maps exceptions to appropriate HTTP status code JSON responses.
    /// </summary>
    public class SampleExceptionMapper
    {
        public JsonResult Map(System.Exception exception)
        {
            JsonResult result = new JsonResult(null);

            if (exception is NotFoundException)
            {
                result.StatusCode = 404;
            }
            else if (exception is BadRequestException)
            {
                result.StatusCode = 400;
            }
            else if (exception is ApiException)
            {
                result.StatusCode = 403;
            }
            else
            {
                result.StatusCode = 500;
            }

            //result.Value = new ApiResponse(ApiResponse.ERROR, exception.Message);

            return result;
        }
    }
    /// <summary>
    /// Exception thrown when attempting to create a session that already exists (HTTP 202).
    /// </summary>
    public class SessionAlreadyBeingCreatedException : ApiException
    {
        public SessionAlreadyBeingCreatedException(string msg) : base(202, msg)
        {

        }
    }
}
