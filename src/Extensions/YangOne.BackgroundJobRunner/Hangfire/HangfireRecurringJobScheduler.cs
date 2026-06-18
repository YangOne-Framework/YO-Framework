// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Storage;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Hangfire
{
    /// <summary>
    /// Hangfire implementation of IRecurringJobScheduler using Hangfire's RecurringJob API.
    /// </summary>
    public class HangfireRecurringJobScheduler : IRecurringJobScheduler
    {
        public Task<string> RegisterAsync(string jobId, Expression<Action> methodCall, string cronExpression)
        {
            RecurringJob.AddOrUpdate(jobId, methodCall, cronExpression);
            return Task.FromResult(jobId);
        }

        public Task<string> RegisterAsync<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression) where T : IJob
        {
            RecurringJob.AddOrUpdate(jobId, methodCall, cronExpression);
            return Task.FromResult(jobId);
        }

        public Task<bool> RemoveAsync(string jobId)
        {
            RecurringJob.RemoveIfExists(jobId);
            return Task.FromResult(true);
        }

        public Task<bool> TriggerAsync(string jobId)
        {
            RecurringJob.Trigger(jobId);
            return Task.FromResult(true);
        }

        public Task<bool> PauseAsync(string jobId)
        {
            RecurringJob.RemoveIfExists(jobId);
            return Task.FromResult(true);
        }

        public Task<bool> ResumeAsync(string jobId)
        {
            return Task.FromResult(true);
        }

        public Task<IEnumerable<RecurringJobInfo>> GetJobsAsync()
        {
            var connection = JobStorage.Current.GetConnection();
            var recurringJobs = connection.GetRecurringJobs();

            var result = recurringJobs.Select(j => new RecurringJobInfo
            {
                JobId = j.Id,
                JobName = j.Id,
                CronExpression = j.Cron,
                NextExecution = j.NextExecution,
                LastExecution = j.LastExecution,
                Enabled = !string.IsNullOrEmpty(j.Cron),
                CreatedAt = DateTime.MinValue
            });

            return Task.FromResult(result);
        }
    }
}
