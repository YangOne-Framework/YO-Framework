// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Storage;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Hangfire
{
    /// <summary>
    /// Hangfire implementation of IJobRunner supporting fire-and-forget, delayed, and continuation jobs.
    /// </summary>
    public class HangfireJobRunner : IJobRunner
    {
        public Task<string> EnqueueAsync(Expression<Action> methodCall)
        {
            return Task.FromResult(BackgroundJob.Enqueue(methodCall));
        }

        public Task<string> EnqueueAsync<T>(Expression<Action<T>> methodCall) where T : IJob
        {
            return Task.FromResult(BackgroundJob.Enqueue(methodCall));
        }

        public Task<string> EnqueueAsync(IJob job)
        {
            throw new NotSupportedException(
                "Hangfire does not support enqueuing IJob instances directly. Use EnqueueAsync<T>() with an expression instead.");
        }

        public Task<string> ScheduleAsync(Expression<Action> methodCall, TimeSpan delay)
        {
            return Task.FromResult(BackgroundJob.Schedule(methodCall, delay));
        }

        public Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, TimeSpan delay) where T : IJob
        {
            return Task.FromResult(BackgroundJob.Schedule(methodCall, delay));
        }

        public Task<string> ScheduleAsync(Expression<Action> methodCall, DateTimeOffset runAt)
        {
            return Task.FromResult(BackgroundJob.Schedule(methodCall, runAt));
        }

        public Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, DateTimeOffset runAt) where T : IJob
        {
            return Task.FromResult(BackgroundJob.Schedule(methodCall, runAt));
        }

        public Task<string> ContinueWithAsync(string parentJobId, Expression<Action> methodCall)
        {
            return Task.FromResult(BackgroundJob.ContinueJobWith(parentJobId, methodCall));
        }

        public Task<bool> DeleteAsync(string jobId)
        {
            return Task.FromResult(BackgroundJob.Delete(jobId));
        }

        public Task<JobResult> GetJobStatusAsync(string jobId)
        {
            try
            {
                using var connection = JobStorage.Current.GetConnection();
                var jobData = connection.GetJobData(jobId);
                if (jobData == null)
                    return Task.FromResult(new JobResult { JobId = jobId, Succeeded = false, ErrorMessage = "Job not found" });

                return Task.FromResult(new JobResult
                {
                    JobId = jobId,
                    Succeeded = jobData.State == "Succeeded",
                    StartedAt = jobData.CreatedAt,
                    CompletedAt = jobData.State == "Succeeded" ? DateTime.UtcNow : null,
                    ErrorMessage = jobData.State
                });
            }
            catch (Exception ex)
            {
                return Task.FromResult(new JobResult { JobId = jobId, Succeeded = false, ErrorMessage = ex.Message });
            }
        }
    }
}
