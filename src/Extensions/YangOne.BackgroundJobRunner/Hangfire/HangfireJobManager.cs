// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Hangfire;
using Hangfire.Storage;
using Hangfire.Storage.Monitoring;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Hangfire
{
    public class HangfireJobManager : IJobManager
    {
        private readonly IJobRunner _runner;
        private readonly IRecurringJobScheduler _scheduler;
        private readonly IJobEngine _engine;
        private readonly JobStorage _storage;

        public HangfireJobManager(IJobRunner runner, IRecurringJobScheduler scheduler, IJobEngine engine, JobStorage storage)
        {
            _runner = runner;
            _scheduler = scheduler;
            _engine = engine;
            _storage = storage;
        }

        public Task<string> EnqueueAsync(Expression<Action> methodCall) => _runner.EnqueueAsync(methodCall);
        public Task<string> EnqueueAsync<T>(Expression<Action<T>> methodCall) where T : IJob => _runner.EnqueueAsync(methodCall);
        public Task<string> EnqueueAsync(IJob job) => _runner.EnqueueAsync(job);
        public Task<string> ScheduleAsync(Expression<Action> methodCall, TimeSpan delay) => _runner.ScheduleAsync(methodCall, delay);
        public Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, TimeSpan delay) where T : IJob => _runner.ScheduleAsync(methodCall, delay);
        public Task<string> ScheduleAsync(Expression<Action> methodCall, DateTimeOffset runAt) => _runner.ScheduleAsync(methodCall, runAt);
        public Task<string> ScheduleAsync<T>(Expression<Action<T>> methodCall, DateTimeOffset runAt) where T : IJob => _runner.ScheduleAsync(methodCall, runAt);
        public Task<string> ContinueWithAsync(string parentJobId, Expression<Action> methodCall) => _runner.ContinueWithAsync(parentJobId, methodCall);
        public Task<bool> DeleteAsync(string jobId) => _runner.DeleteAsync(jobId);
        public Task<JobResult> GetJobStatusAsync(string jobId) => _runner.GetJobStatusAsync(jobId);

        public Task<string> RegisterAsync(string jobId, Expression<Action> methodCall, string cronExpression) => _scheduler.RegisterAsync(jobId, methodCall, cronExpression);
        public Task<string> RegisterAsync<T>(string jobId, Expression<Action<T>> methodCall, string cronExpression) where T : IJob => _scheduler.RegisterAsync(jobId, methodCall, cronExpression);
        public Task<bool> RemoveAsync(string jobId) => _scheduler.RemoveAsync(jobId);
        public Task<bool> TriggerAsync(string jobId) => _scheduler.TriggerAsync(jobId);
        public Task<bool> PauseAsync(string jobId) => _scheduler.PauseAsync(jobId);
        public Task<bool> ResumeAsync(string jobId) => _scheduler.ResumeAsync(jobId);
        public Task<IEnumerable<RecurringJobInfo>> GetJobsAsync() => _scheduler.GetJobsAsync();

        public Task StartAsync(CancellationToken ct = default) => _engine.StartAsync(ct);
        public Task StopAsync(CancellationToken ct = default) => _engine.StopAsync(ct);
        public bool IsRunning => _engine.IsRunning;

        public Task<PagedResult<SucceededJobInfo>> GetSucceededJobsAsync(int from, int count)
        {
            var monitor = _storage.GetMonitoringApi();
            var result = monitor.SucceededJobs(from, count);
            return Task.FromResult(new PagedResult<SucceededJobInfo>
            {
                TotalCount = result.Count,
                Items = result.Select(j => new SucceededJobInfo
                {
                    JobId = j.Key,
                    MethodName = j.Value.Job.Method.Name,
                    Arguments = j.Value.Job.Args.ToArray(),
                    TotalDuration = j.Value.TotalDuration,
                    SucceededAt = j.Value.SucceededAt
                })
            });
        }

        public Task<PagedResult<FailedJobInfo>> GetFailedJobsAsync(int from, int count)
        {
            var monitor = _storage.GetMonitoringApi();
            var result = monitor.FailedJobs(from, count);
            return Task.FromResult(new PagedResult<FailedJobInfo>
            {
                TotalCount = result.Count,
                Items = result.Select(j => new FailedJobInfo
                {
                    JobId = j.Key,
                    MethodName = j.Value.Job.Method.Name,
                    Arguments = j.Value.Job.Args.ToArray(),
                    FailedAt = j.Value.FailedAt,
                    Reason = j.Value.Reason
                })
            });
        }

        public Task<PagedResult<JobInfo>> GetEnqueuedJobsAsync(string queue, int from, int count)
        {
            var monitor = _storage.GetMonitoringApi();
            var result = monitor.EnqueuedJobs(queue, from, count);
            return Task.FromResult(new PagedResult<JobInfo>
            {
                TotalCount = result.Count,
                Items = result.Select(j => new JobInfo
                {
                    JobId = j.Key,
                    MethodName = j.Value.Job.Method.Name,
                    Arguments = j.Value.Job.Args.ToArray()
                })
            });
        }

        public Task<PagedResult<JobInfo>> GetProcessingJobsAsync(int from, int count)
        {
            var monitor = _storage.GetMonitoringApi();
            var result = monitor.ProcessingJobs(from, count);
            return Task.FromResult(new PagedResult<JobInfo>
            {
                TotalCount = result.Count,
                Items = result.Select(j => new JobInfo
                {
                    JobId = j.Key,
                    MethodName = j.Value.Job.Method.Name,
                    Arguments = j.Value.Job.Args.ToArray()
                })
            });
        }

        public Task<PagedResult<JobInfo>> GetScheduledJobsAsync(int from, int count)
        {
            var monitor = _storage.GetMonitoringApi();
            var result = monitor.ScheduledJobs(from, count);
            return Task.FromResult(new PagedResult<JobInfo>
            {
                TotalCount = result.Count,
                Items = result.Select(j => new JobInfo
                {
                    JobId = j.Key,
                    MethodName = j.Value.Job.Method.Name,
                    Arguments = j.Value.Job.Args.ToArray()
                })
            });
        }

        public Task<JobStats> GetStatsAsync()
        {
            var monitor = _storage.GetMonitoringApi();
            var stats = monitor.GetStatistics();
            return Task.FromResult(new JobStats
            {
                Servers = (int)stats.Servers,
                Queues = (int)stats.Queues,
                Succeeded = stats.Succeeded,
                Failed = stats.Failed,
                Processing = (int)stats.Processing,
                Enqueued = (int)stats.Enqueued,
                Scheduled = (int)stats.Scheduled,
                Deleted = stats.Deleted,
                Recurring = (int)stats.Recurring
            });
        }

        public Task<WorkerStatusOverview> GetWorkerStatusAsync()
        {
            var monitor = _storage.GetMonitoringApi();
            var servers = monitor.Servers();
            var stats = monitor.GetStatistics();
            var workers = servers.Select(s => new WorkerInfo
            {
                Name = s.Name,
                WorkersCount = s.WorkersCount,
                Queues = (s.Queues ?? Array.Empty<string>()).ToArray(),
                Status = "Active",
                StartedAt = s.StartedAt
            });
            return Task.FromResult(new WorkerStatusOverview
            {
                TotalServers = workers.Count(),
                TotalWorkers = workers.Sum(w => w.WorkersCount),
                ActiveJobs = (int)stats.Processing,
                Workers = workers
            });
        }
    }
}
