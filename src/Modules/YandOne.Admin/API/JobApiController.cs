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
        public async Task<IActionResult> GetRecurringJobs()
        {
            try
            {
                var jobs = await _jobManager.GetJobsAsync();
                return SuccessResponse("Success", jobs);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpDelete("recurring/{jobId}")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> RemoveRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.RemoveAsync(jobId);
                return SuccessResponse("Recurring job removed", new { Success = result });
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/trigger")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> TriggerRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.TriggerAsync(jobId);
                return SuccessResponse("Recurring job triggered", new { Success = result });
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/pause")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> PauseRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.PauseAsync(jobId);
                return SuccessResponse("Recurring job paused", new { Success = result });
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpPost("recurring/{jobId}/resume")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> ResumeRecurringJob(string jobId)
        {
            try
            {
                var result = await _jobManager.ResumeAsync(jobId);
                return SuccessResponse("Recurring job resumed", new { Success = result });
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        #endregion

        #region Job History by State

        [HttpGet("succeeded")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetSucceededJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetSucceededJobsAsync(offset, count);
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("failed")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetFailedJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetFailedJobsAsync(offset, count);
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("enqueued")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetEnqueuedJobs([FromQuery] string queue = "default", [FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetEnqueuedJobsAsync(queue, offset, count);
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("processing")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetProcessingJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetProcessingJobsAsync(offset, count);
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("scheduled")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetScheduledJobs([FromQuery] int offset = 0, [FromQuery] int count = 50)
        {
            try
            {
                var result = await _jobManager.GetScheduledJobsAsync(offset, count);
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("workers")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetWorkerStatus()
        {
            try
            {
                var result = await _jobManager.GetWorkerStatusAsync();
                return SuccessResponse("Success", result);
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        [HttpGet("stats")]
        [Authorize(Roles = "Admin,SuperAdmin")]
        public async Task<IActionResult> GetJobStats()
        {
            try
            {
                var stats = await _jobManager.GetStatsAsync();
                return SuccessResponse("Success", stats);
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
        public async Task<IActionResult> DeleteJob(string jobId)
        {
            try
            {
                var result = await _jobManager.DeleteAsync(jobId);
                return SuccessResponse("Job deleted", new { Success = result });
            }
            catch (Exception e)
            {
                _logger.Log(LogType.Error, () => e.Message, e);
                return ErrorResponse(501, e.Message);
            }
        }

        #endregion
    }
}
