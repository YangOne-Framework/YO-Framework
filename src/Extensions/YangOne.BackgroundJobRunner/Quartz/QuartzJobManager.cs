// Copyright (c) Yang One Framework. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using Quartz;
using Quartz.Impl.Matchers;
using YOJob = YangOne.Job.IJob;
using YangOne.Job;

namespace YangOne.BackgroundJobRunner.Quartz
{
    public class QuartzJobManager : IJobManager
    {
        private readonly IJobRunner _runner;
        private readonly IRecurringJobScheduler _scheduler;
        private readonly IJobEngine _engine;
        private readonly ISchedulerFactory _schedulerFactory;

        public QuartzJobManager(IJobRunner runner, IRecurringJobScheduler scheduler, IJobEngine engine, ISchedulerFactory schedulerFactory)
        {
            _runner = runner;
            _scheduler = scheduler;
            _engine = engine;
            _schedulerFactory = schedulerFactory;
        }

        public Task<string> EnqueueAsync(Expression<Action> m) => _runner.EnqueueAsync(m);
        public Task<string> EnqueueAsync<T>(Expression<Action<T>> m) where T : YOJob => _runner.EnqueueAsync(m);
        public Task<string> EnqueueAsync(YOJob j) => _runner.EnqueueAsync(j);
        public Task<string> ScheduleAsync(Expression<Action> m, TimeSpan d) => _runner.ScheduleAsync(m, d);
        public Task<string> ScheduleAsync<T>(Expression<Action<T>> m, TimeSpan d) where T : YOJob => _runner.ScheduleAsync(m, d);
        public Task<string> ScheduleAsync(Expression<Action> m, DateTimeOffset r) => _runner.ScheduleAsync(m, r);
        public Task<string> ScheduleAsync<T>(Expression<Action<T>> m, DateTimeOffset r) where T : YOJob => _runner.ScheduleAsync(m, r);
        public Task<string> ContinueWithAsync(string p, Expression<Action> m) => _runner.ContinueWithAsync(p, m);
        public Task<bool> DeleteAsync(string j) => _runner.DeleteAsync(j);
        public Task<JobResult> GetJobStatusAsync(string j) => _runner.GetJobStatusAsync(j);

        public Task<string> RegisterAsync(string j, Expression<Action> m, string c) => _scheduler.RegisterAsync(j, m, c);
        public Task<string> RegisterAsync<T>(string j, Expression<Action<T>> m, string c) where T : YOJob => _scheduler.RegisterAsync(j, m, c);
        public Task<bool> RemoveAsync(string j) => _scheduler.RemoveAsync(j);
        public Task<bool> TriggerAsync(string j) => _scheduler.TriggerAsync(j);
        public Task<bool> PauseAsync(string j) => _scheduler.PauseAsync(j);
        public Task<bool> ResumeAsync(string j) => _scheduler.ResumeAsync(j);
        public Task<IEnumerable<RecurringJobInfo>> GetJobsAsync() => _scheduler.GetJobsAsync();

        public Task StartAsync(CancellationToken ct = default) => _engine.StartAsync(ct);
        public Task StopAsync(CancellationToken ct = default) => _engine.StopAsync(ct);
        public bool IsRunning => _engine.IsRunning;

        public async Task<PagedResult<SucceededJobInfo>> GetSucceededJobsAsync(int from, int count)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());
            var items = jobKeys
                .Select(k => new SucceededJobInfo { JobId = k.Name, MethodName = k.Group })
                .Skip(from).Take(count).ToList();
            return new PagedResult<SucceededJobInfo>
            {
                TotalCount = items.Count,
                Items = items
            };
        }

        public async Task<PagedResult<FailedJobInfo>> GetFailedJobsAsync(int from, int count)
        {
            return await Task.FromResult(new PagedResult<FailedJobInfo> { TotalCount = 0, Items = new List<FailedJobInfo>() });
        }

        public async Task<PagedResult<JobInfo>> GetEnqueuedJobsAsync(string queue, int from, int count)
        {
            return await Task.FromResult(new PagedResult<JobInfo> { TotalCount = 0, Items = new List<JobInfo>() });
        }

        public async Task<PagedResult<JobInfo>> GetProcessingJobsAsync(int from, int count)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var executingJobs = await scheduler.GetCurrentlyExecutingJobs();
            var items = executingJobs
                .Select(j => new JobInfo
                {
                    JobId = j.JobDetail.Key.Name,
                    MethodName = j.JobDetail.JobType.Name
                })
                .Skip(from).Take(count).ToList();
            return new PagedResult<JobInfo>
            {
                TotalCount = items.Count,
                Items = items
            };
        }

        public async Task<PagedResult<JobInfo>> GetScheduledJobsAsync(int from, int count)
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());
            var items = new List<JobInfo>();
            foreach (var key in jobKeys)
            {
                var triggers = await scheduler.GetTriggersOfJob(key);
                if (triggers.Any(t => t.GetNextFireTimeUtc().HasValue))
                {
                    items.Add(new JobInfo { JobId = key.Name, MethodName = key.Group });
                }
            }
            return new PagedResult<JobInfo>
            {
                TotalCount = items.Count,
                Items = items.Skip(from).Take(count).ToList()
            };
        }

        public async Task<JobStats> GetStatsAsync()
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKeys = await scheduler.GetJobKeys(GroupMatcher<JobKey>.AnyGroup());
            var executingJobs = await scheduler.GetCurrentlyExecutingJobs();
            return await Task.FromResult(new JobStats
            {
                Servers = 0,
                Queues = 0,
                Succeeded = 0,
                Failed = 0,
                Processing = executingJobs.Count,
                Enqueued = 0,
                Scheduled = jobKeys.Count,
                Deleted = 0,
                Recurring = jobKeys.Count
            });
        }

        public async Task<WorkerStatusOverview> GetWorkerStatusAsync()
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var meta = await scheduler.GetMetaData();
            var executingJobs = await scheduler.GetCurrentlyExecutingJobs();
            var workerInfo = new WorkerInfo
            {
                Name = meta.SchedulerName,
                WorkersCount = meta.ThreadPoolSize,
                Queues = new[] { "default" },
                Status = scheduler.IsStarted ? "Active" : "Standby",
                StartedAt = DateTime.UtcNow
            };
            return await Task.FromResult(new WorkerStatusOverview
            {
                TotalServers = 1,
                TotalWorkers = meta.ThreadPoolSize,
                ActiveJobs = executingJobs.Count,
                Workers = new[] { workerInfo }
            });
        }
    }
}
