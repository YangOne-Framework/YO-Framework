// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YangOne.Job;
using YangOne.Log;
using YangOne.Web.API;

namespace YandOne.Admin.API
{
    [Route("api/v1/job")]
    public class JobApiController : BaseApiController
    {
        private readonly ILogger _logger;
        private readonly IJobManager _jobManager;

        public JobApiController(ILogger logger, IJobManager jobManager)
        {
            _logger = logger;
            _jobManager = jobManager;
        }

        #region Recurring Jobs

        [HttpGet("recurring")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetRecurringJobs()
        {
            try
            {
                var jobs = await _jobManager.GetJobsAsync();
                return SuccessResponse("Success", (object)jobs);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpDelete("recurring/{jobId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> RemoveRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.RemoveAsync(jobId);
                return SuccessResponse("Recurring job removed", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse<bool>(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/trigger")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> TriggerRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.TriggerAsync(jobId);
                return SuccessResponse("Recurring job triggered", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse<bool>(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/pause")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> PauseRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.PauseAsync(jobId);
                return SuccessResponse("Recurring job paused", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse<bool>(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/resume")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> ResumeRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.ResumeAsync(jobId);
                return SuccessResponse("Recurring job resumed", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse<bool>(501, e.Message);
            }
        }

        #endregion

        #region Job History by State

        [HttpGet("succeeded")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetSucceededJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetSucceededJobsAsync(offset, count);
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("failed")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetFailedJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetFailedJobsAsync(offset, count);
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("enqueued")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetEnqueuedJobs([FromQuery] string queue = "default", [FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetEnqueuedJobsAsync(queue, offset, count);
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("processing")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetProcessingJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetProcessingJobsAsync(offset, count);
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("scheduled")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetScheduledJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetScheduledJobsAsync(offset, count);
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("workers")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetWorkerStatus()
        {
            try
            {
                var result = await _jobManager.GetWorkerStatusAsync();
                return SuccessResponse("Success", (object)result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<object>>> GetJobStats()
        {
            try
            {
                var stats = await _jobManager.GetStatsAsync();
                return SuccessResponse("Success", (object)stats);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        #endregion

        #region Single Job Operations

        [HttpDelete("{jobId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteJob(string jobId)
        {
            try
            {
                var result = await _jobManager.DeleteAsync(jobId);
                return SuccessResponse("Job deleted", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse<bool>(501, e.Message);
            }
        }

        #endregion
    }
}
