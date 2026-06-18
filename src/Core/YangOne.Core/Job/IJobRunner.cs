// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace YangOne.Job
{
    /// <summary>
    /// Provides fire-and-forget and deferred job execution.
    /// </summary>
    public interface IJobRunner
    {
        /// <summary>Enqueues a fire-and-forget job from a method expression.</summary>
        Task<string> EnqueueAsync(Expression<Action> methodCall);

        /// <summary>Enqueues a fire-and-forget job from an IJob type.</summary>
        Task<string> EnqueueAsync<T>(Expression<Action<T>> methodCall) where T : IJob;

        /// <summary>Enqueues a fire-and-forget job from an IJob instance.</summary>
        Task<string> EnqueueAsync(IJob job);

        /// <summary>Runs a job after a specified delay.</summary>
        Task<string> ScheduleAsync(Expression<Action> methodCall, TimeSpan delay);

        /// <summary>Runs an IJob after a specified delay.</summary>
        Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, TimeSpan delay) where T : IJob;

        /// <summary>Runs a job at a specific date/time.</summary>
        Task<string> ScheduleAsync(Expression<Action> methodCall, DateTimeOffset runAt);

        /// <summary>Runs an IJob at a specific date/time.</summary>
        Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, DateTimeOffset runAt) where T : IJob;

        /// <summary>Enqueues a job that runs after the parent job completes.</summary>
        Task<string> ContinueWithAsync(string parentJobId, Expression<Action> methodCall);

        /// <summary>Deletes a job by its identifier.</summary>
        Task<bool> DeleteAsync(string jobId);

        /// <summary>Gets the status of a job.</summary>
        Task<JobResult> GetJobStatusAsync(string jobId);
    }
}
