// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System.Collections.Generic;
using System.Threading.Tasks;

namespace YangOne.Job
{
    /// <summary>
    /// Job monitoring interface for querying job history, state, and statistics.
    /// Provider-agnostic — Hangfire, Quartz, etc. each provide their own implementation.
    /// </summary>
    public interface IJobMonitor
    {
        Task<PagedResult<SucceededJobInfo>> GetSucceededJobsAsync(int from, int count);
        Task<PagedResult<FailedJobInfo>> GetFailedJobsAsync(int from, int count);
        Task<PagedResult<JobInfo>> GetEnqueuedJobsAsync(string queue, int from, int count);
        Task<PagedResult<JobInfo>> GetProcessingJobsAsync(int from, int count);
        Task<PagedResult<JobInfo>> GetScheduledJobsAsync(int from, int count);
        Task<JobStats> GetStatsAsync();
        Task<WorkerStatusOverview> GetWorkerStatusAsync();
    }
}
