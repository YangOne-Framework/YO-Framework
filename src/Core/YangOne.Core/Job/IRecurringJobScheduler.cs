// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace YangOne.Job
{
    /// <summary>
    /// Manages recurring/cron-based background jobs.
    /// </summary>
    public interface IRecurringJobScheduler
    {
        /// <summary>Registers or updates a recurring job from a method expression.</summary>
        Task<string> RegisterAsync(string jobId, Expression<Action> methodCall, string cronExpression);

        /// <summary>Registers or updates a recurring job from an IJob type.</summary>
        Task<string> RegisterAsync<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression) where T : IJob;

        /// <summary>Removes a recurring job.</summary>
        Task<bool> RemoveAsync(string jobId);

        /// <summary>Triggers a recurring job immediately without waiting for its cron schedule.</summary>
        Task<bool> TriggerAsync(string jobId);

        /// <summary>Pauses (disables) a recurring job.</summary>
        Task<bool> PauseAsync(string jobId);

        /// <summary>Resumes (enables) a previously paused recurring job.</summary>
        Task<bool> ResumeAsync(string jobId);

        /// <summary>Returns all registered recurring jobs.</summary>
        Task<IEnumerable<RecurringJobInfo>> GetJobsAsync();
    }
}
